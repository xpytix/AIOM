const express = require('express');
const router = express.Router();
const Point = require('../models/Point');
const Map = require('../models/Map');


router.get('/', async (req, res) => {
  try {
    const filter = req.query.mapId ? { map: req.query.mapId } : {};
    const points = await Point.find(filter).populate('pointType', 'name icon');
    res.json(points);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/:id', async (req, res) => {
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


router.post('/', async (req, res) => {
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


router.put('/:id', async (req, res) => {
    try {
        const updatedPoint = await Point.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPoint) return res.status(404).json({ message: 'Nie znaleziono punktu' });
        res.json(updatedPoint);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE - Usuwanie punktu po ID
router.delete('/:id', async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);
    if (!point) return res.status(404).json({ message: 'Nie znaleziono punktu' });
    
    const mapId = point.map;

    // POPRAWKA: Użyj .deleteOne() zamiast .remove() lub .delete()
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
