const express = require('express');
const router = express.Router();
const Walk3D = require('../models/Walk3D');
const Map = require('../models/Map');
const Point = require('../models/Point');
const { protect, authorize } = require('../middleware/authMiddleware'); // IMPORT STRAŻNIKÓW

// GET - Pobieranie spacerów 3D (dla wszystkich zalogowanych)
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.query.mapId ? { map: req.query.mapId } : {};
    const walks = await Walk3D.find(filter).populate('points');
    res.json(walks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Pobieranie jednego spaceru 3D po ID (dla wszystkich zalogowanych)
router.get('/:id', protect, async (req, res) => {
  try {
    const walk = await Walk3D.findById(req.params.id).populate('points');
    if (!walk) {
      return res.status(404).json({ message: 'Nie znaleziono spaceru 3D' });
    }
    res.json(walk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Tworzenie nowego spaceru 3D (dla admina i managera)
router.post('/', [protect, authorize('admin', 'manager')], async (req, res) => {
  const walk = new Walk3D({
    name: req.body.name,
    description: req.body.description,
    url: req.body.url,
    map: req.body.map
  });

  try {
    const newWalk = await walk.save();
    await Map.findByIdAndUpdate(newWalk.map, { $push: { walks3D: newWalk._id } });
    res.status(201).json(newWalk);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Aktualizacja spaceru 3D po ID (dla admina i managera)
router.put('/:id', [protect, authorize('admin', 'manager')], async (req, res) => {
    try {
        const updatedWalk = await Walk3D.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedWalk) return res.status(404).json({ message: 'Nie znaleziono spaceru 3D' });
        res.json(updatedWalk);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE - Usuwanie spaceru 3D po ID (dla admina i managera)
router.delete('/:id', [protect, authorize('admin', 'manager')], async (req, res) => {
  try {
    const walk = await Walk3D.findById(req.params.id);
    if (!walk) return res.status(404).json({ message: 'Nie znaleziono spaceru 3D' });
    
    await Map.findByIdAndUpdate(walk.map, { $pull: { walks3D: walk._id } });
    await Point.updateMany({ _id: { $in: walk.points } }, { $set: { walk3D: null } });
    
    // POPRAWKA: Użycie nowoczesnej i poprawnej metody .deleteOne()
    await walk.deleteOne();

    res.json({ message: 'Pomyślnie usunięto spacer 3D i zaktualizowano relacje' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;