const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Point = require('../models/Point');
const Map = require('../models/Map');
const { protect, authorize } = require('../middleware/authMiddleware'); // IMPORT STRAŻNIKÓW

// --- Konfiguracja Multer do przesyłania zdjęć ---

// Upewnij się, że katalog 'uploads' istnieje w katalogu 'be'
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Definicja miejsca zapisu i nazewnictwa plików
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtr plików, aby akceptować tylko określone formaty obrazów
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Dozwolone są tylko pliki w formacie .png, .jpg lub .jpeg!'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 5, files: 6 } }); // Limit 5MB na plik, max 6 plików

// GET - Pobieranie wszystkich punktów (dla wszystkich zalogowanych)
// GET - Pobieranie wszystkich punktów
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.query.mapId ? { map: req.query.mapId } : {};
    // Odchudzamy zapytanie, ale zostawiamy nextInspectionDate dla logiki statusu
    let points = await Point.find(filter)
      .select('-lastInspectionDate -photos')
      .populate('pointType', 'name icon color');

    
    // Konwertuj dokumenty Mongoose na zwykłe obiekty, aby można je było modyfikować
    points = points.map(p => p.toObject());

    const today = new Date();

    // Sprawdź każdy punkt i dynamicznie dodaj/zmień status
    for (const point of points) {
      if (point.nextInspectionDate && new Date(point.nextInspectionDate) < today) {
        // Jeśli punkt jest przeterminowany, nadaj mu status "Po terminie"
        point.status = 'Po terminie';
      }
      // Usuwamy pole inspekcji z finalnego obiektu, aby nie wysyłać go do klienta
      delete point.nextInspectionDate;
    }

    res.json(points);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Pobieranie jednego punktu po ID (dla wszystkich zalogowanych)
router.get('/:id', protect, async (req, res) => {
  try {
    const point = await Point.findById(req.params.id).populate('pointType').populate('map');
    if (!point) {
      return res.status(404).json({ message: 'Nie znaleziono punktu' });
    }
    res.json(point);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Tworzenie nowego punktu (dla admina i managera)
router.post('/', [protect, authorize('admin', 'manager'), upload.array('photos', 5)], async (req, res) => {
  const { name, description, status, location, pointType, map, walk3D } = req.body;

  // Tworzymy ścieżki URL, które będą serwowane przez Express
  const photoPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  try {
    const pointData = {
      name,
      description,
      status,
      location: JSON.parse(location), // Dane z formularza FormData są stringami
      pointType,
      map,
      photos: photoPaths,
    };

    if (walk3D) {
      pointData.walk3D = walk3D;
    }

    const point = new Point(pointData);
    const newPoint = await point.save();

    await Map.findByIdAndUpdate(
      newPoint.map,
      { $push: { points: newPoint._id } }
    );

    // Zwracamy nowo utworzony punkt z populacją, aby frontend miał kompletne dane
    const populatedPoint = await Point.findById(newPoint._id).populate('pointType', 'name icon color');
    res.status(201).json(populatedPoint);
  } catch (err) {
    // Jeśli zapis do bazy się nie uda, usuń przesłane pliki, aby nie zaśmiecać serwera
    photoPaths.forEach(p => {
      fs.unlink(path.join(uploadDir, path.basename(p)), (unlinkErr) => {
        if (unlinkErr) console.error(`Błąd podczas usuwania pliku po nieudanym zapisie punktu: ${p}`, unlinkErr);
      });
    });
    res.status(400).json({ message: err.message });
  }
});

// PUT - Aktualizacja punktu po ID (dla wszystkich zalogowanych)
router.put('/:id', [protect, authorize('admin', 'manager'), upload.array('photos', 6)], async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);
    if (!point) return res.status(404).json({ message: 'Nie znaleziono punktu' });

    const { name, description, pointType, status } = req.body;

    // Sprawdzenie limitu zdjęć
    const existingPhotosCount = point.photos ? point.photos.length : 0;
    const newPhotosCount = req.files ? req.files.length : 0;
    if (existingPhotosCount + newPhotosCount > 6) {
      // Posprzątaj wgrane pliki, jeśli przekroczono limit
      if (req.files) {
        req.files.forEach(file => fs.unlink(path.join(uploadDir, file.filename), () => {}));
      }
      return res.status(400).json({ message: 'Punkt może mieć maksymalnie 6 zdjęć.' });
    }

    // Przygotuj ścieżki do nowych zdjęć
    const newPhotoPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Zaktualizuj dane punktu
    point.name = name || point.name;
    point.description = description === undefined ? point.description : description;
    point.pointType = pointType || point.pointType;
    point.status = status || point.status;
    point.photos.push(...newPhotoPaths); // Dodaj nowe zdjęcia do istniejących

    const updatedPoint = await point.save();
    const populatedPoint = await updatedPoint.populate('pointType');

    res.json(populatedPoint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Usuwanie jednego zdjęcia z punktu (dla admina i managera)
router.delete('/:id/photo', [protect, authorize('admin', 'manager')], async (req, res) => {
  const { photoUrl } = req.body;
  const { id } = req.params;

  if (!photoUrl) {
    return res.status(400).json({ message: 'Brak ścieżki do zdjęcia w ciele żądania.' });
  }

  try {
    // 1. Usuń plik z serwera
    const filename = path.basename(photoUrl);
    const fullPath = path.join(uploadDir, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // 2. Usuń ścieżkę z bazy danych i zwróć zaktualizowany dokument
    const updatedPoint = await Point.findByIdAndUpdate(
      id,
      { $pull: { photos: photoUrl } },
      { new: true }
    ).populate('pointType'); // Populate, aby zwrócić pełne dane do frontendu

    if (!updatedPoint) return res.status(404).json({ message: 'Nie znaleziono punktu' });
    res.json(updatedPoint);
  } catch (err) {
    res.status(500).json({ message: `Błąd serwera podczas usuwania zdjęcia: ${err.message}` });
  }
});

// DELETE - Usuwanie punktu po ID (dla admina i managera)
router.delete('/:id', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);
    if (!point) return res.status(404).json({ message: 'Nie znaleziono punktu' });

    // Usuń powiązane zdjęcia z serwera
    if (point.photos && point.photos.length > 0) {
      point.photos.forEach(photoUrl => {
        const filename = path.basename(photoUrl);
        const fullPath = path.join(uploadDir, filename);
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) console.error(`Nie udało się usunąć zdjęcia: ${fullPath}`, err);
          });
        }
      });
    }

    const mapId = point.map;
    await point.deleteOne();

    await Map.findByIdAndUpdate(
      mapId,
      { $pull: { points: point._id } }
    );

    res.json({ message: 'Pomyślnie usunięto punkt i zaktualizowano mapę' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;