const express = require('express');
const router = express.Router();
const PointType = require('../models/PointType');
const { protect, authorize } = require('../middleware/authMiddleware'); // IMPORT STRAŻNIKÓW

// GET - Pobieranie wszystkich typów punktów (dla wszystkich zalogowanych)
router.get('/', protect, async (req, res) => {
  try {
    const pointTypes = await PointType.find();
    res.json(pointTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Pobieranie jednego typu punktu po ID (dla wszystkich zalogowanych)
router.get('/:id', protect, async (req, res) => {
    try {
      const pointType = await PointType.findById(req.params.id);
      if (!pointType) {
        return res.status(404).json({ message: 'Nie znaleziono typu punktu o podanym ID' });
      }
      res.json(pointType);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// POST - Tworzenie nowego typu punktu (tylko dla admina)
router.post('/', [protect, authorize('admin')], async (req, res) => {
  const pointType = new PointType({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color // Dodajemy obsługę koloru
  });

  try {
    const newPointType = await pointType.save();
    res.status(201).json(newPointType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Aktualizacja typu punktu po ID (tylko dla admina)
router.put('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
      const updatedPointType = await PointType.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true }
      );
      if (!updatedPointType) {
        return res.status(404).json({ message: 'Nie znaleziono typu punktu o podanym ID' });
      }
      res.json(updatedPointType);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

// DELETE - Usuwanie typu punktu po ID (tylko dla admina)
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
      const deletedPointType = await PointType.findByIdAndDelete(req.params.id);

      if (!deletedPointType) {
        return res.status(404).json({ message: 'Nie znaleziono typu punktu o podanym ID' });
      }

      res.json({ message: 'Pomyślnie usunięto typ punktu' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
module.exports = router;