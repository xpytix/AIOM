const express = require('express');
const router = express.Router();
const PointType = require('../models/PointType');

router.get('/', async (req, res) => {
  try {
    const pointTypes = await PointType.find();
    res.json(pointTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/', async (req, res) => {
  const pointType = new PointType({
    name: req.body.name,
    icon: req.body.icon
  });

  try {
    const newPointType = await pointType.save();
    res.status(201).json(newPointType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.get('/:id', async (req, res) => {
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


router.put('/:id', async (req, res) => {
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


router.delete('/:id', async (req, res) => {
  try {
    // Używamy findByIdAndDelete zamiast findById, a potem remove
    const deletedPointType = await PointType.findByIdAndDelete(req.params.id);

    if (!deletedPointType) {
      // Jeśli nic nie zostało usunięte, to znaczy, że nie znaleziono obiektu
      return res.status(404).json({ message: 'Nie znaleziono typu punktu o podanym ID' });
    }

    res.json({ message: 'Pomyślnie usunięto typ punktu' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
  
module.exports = router;
