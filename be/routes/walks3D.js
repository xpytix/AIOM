const express = require('express');
const router = express.Router();
const Walk3D = require('../models/Walk3D');
const Map = require('../models/Map');
const Point = require('../models/Point');


router.get('/', async (req, res) => {
  try {
    const filter = req.query.mapId ? { map: req.query.mapId } : {};
    const walks = await Walk3D.find(filter).populate('points');
    res.json(walks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
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

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
    try {
        const updatedWalk = await Walk3D.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedWalk) return res.status(404).json({ message: 'Nie znaleziono spaceru 3D' });
        res.json(updatedWalk);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
  try {
    const walk = await Walk3D.findById(req.params.id);
    if (!walk) return res.status(404).json({ message: 'Nie znaleziono spaceru 3D' });
    
    await Map.findByIdAndUpdate(walk.map, { $pull: { walks3D: walk._id } });
    await Point.updateMany({ _id: { $in: walk.points } }, { $set: { walk3D: null } });
    await walk.remove();

    res.json({ message: 'Pomyślnie usunięto spacer 3D i zaktualizowano relacje' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
