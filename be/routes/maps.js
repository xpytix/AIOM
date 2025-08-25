const express = require('express');
const router = express.Router();
const Map = require('../models/Map');
const Point = require('../models/Point');
const Walk3D = require('../models/Walk3D');
const { protect, authorize } = require('../middleware/authMiddleware'); // IMPORTUJEMY STRAŻNIKÓW

// GET - Pobieranie wszystkich map (dla wszystkich zalogowanych)
router.get('/', protect, async (req, res) => {
  try {
    // Używamy .select(), aby całkowicie wykluczyć pola 'points' i 'walks3D' z wyników.
    // Znak minusa (-) przed nazwą pola oznacza jego wykluczenie.
    const maps = await Map.find().select('-points -walks3D');
    res.json(maps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Pobieranie jednej mapy po ID (dla wszystkich zalogowanych)
router.get('/:id', protect, async (req, res) => {
  try {
    const map = await Map.findById(req.params.id).populate('points').populate('walks3D');
    if (!map) {
      return res.status(404).json({ message: 'Nie znaleziono mapy o podanym ID' });
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Tworzenie nowej mapy (dla admina i managera)
router.post('/', [protect, authorize('admin', 'manager')], async (req, res) => {
  const map = new Map({
    name: req.body.name,
    description: req.body.description,
    imageUrl: req.body.imageUrl
  });

  try {
    const newMap = await map.save();
    res.status(201).json(newMap);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Aktualizacja mapy po ID (dla admina i managera)
router.put('/:id', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const updatedMap = await Map.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMap) {
      return res.status(404).json({ message: 'Nie znaleziono mapy o podanym ID' });
    }
    res.json(updatedMap);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Usuwanie mapy po ID (tylko dla admina)
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const map = await Map.findById(req.params.id);
    if (!map) {
      return res.status(404).json({ message: 'Nie znaleziono mapy' });
    }

    await Point.deleteMany({ _id: { $in: map.points } });
    await Walk3D.deleteMany({ _id: { $in: map.walks3D } });
    await map.deleteOne();
    
    res.json({ message: 'Pomyślnie usunięto mapę oraz wszystkie jej punkty i spacery 3D' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;