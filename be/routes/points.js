const express = require('express');
const router = express.Router();
const Point = require('../models/Point');
const Map = require('../models/Map');
const { protect, authorize } = require('../middleware/authMiddleware'); // IMPORT STRAŻNIKÓW

// GET - Pobieranie wszystkich punktów (dla wszystkich zalogowanych)
// GET - Pobieranie wszystkich punktów
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.query.mapId ? { map: req.query.mapId } : {};
    let points = await Point.find(filter).populate('pointType', 'name icon color')

    
    // Konwertuj dokumenty Mongoose na zwykłe obiekty, aby można je było modyfikować
    points = points.map(p => p.toObject());

    const today = new Date();

    // Sprawdź każdy punkt i dynamicznie dodaj/zmień status
    for (const point of points) {
      if (point.nextInspectionDate && new Date(point.nextInspectionDate) < today) {
        // Jeśli punkt jest przeterminowany, nadaj mu status "Po terminie"
        point.status = 'Po terminie';
      }
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
router.post('/', [protect, authorize('admin', 'manager')], async (req, res) => {
  const point = new Point({
    name: req.body.name,
    description: req.body.description,
    status: req.body.status,
    location: req.body.location,
    pointType: req.body.pointType,
    map: req.body.map,
    walk3D: req.body.walk3D
  });

  try {
    const newPoint = await point.save();
    await Map.findByIdAndUpdate(
      newPoint.map,
      { $push: { points: newPoint._id } }
    );
    res.status(201).json(newPoint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Aktualizacja punktu po ID (dla wszystkich zalogowanych)
router.put('/:id', protect, async (req, res) => {
    try {
        const updatedPoint = await Point.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPoint) return res.status(404).json({ message: 'Nie znaleziono punktu' });
        res.json(updatedPoint);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE - Usuwanie punktu po ID (dla admina i managera)
router.delete('/:id', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);
    if (!point) return res.status(404).json({ message: 'Nie znaleziono punktu' });
    
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