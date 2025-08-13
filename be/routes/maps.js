const express = require('express');
const router = express.Router();
const Map = require('../models/Map');
const Point = require('../models/Point');

/**
 * @swagger
 * tags:
 * - name: Maps
 * description: API do zarządzania mapami
 */

/**
 * @swagger
 * /api/maps:
 * get:
 * summary: Pobiera listę wszystkich map
 * tags: [Maps]
 * responses:
 * 200:
 * description: Lista map z populacją powiązanych punktów i spacerów 3D
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Map'
 */
router.get('/', async (req, res) => {
  try {
    const maps = await Map.find().populate('points').populate('walks3D');
    res.json(maps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/maps/{id}:
 * get:
 * summary: Pobiera jedną mapę po ID
 * tags: [Maps]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: ID mapy
 * responses:
 * 200:
 * description: Dane mapy
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Map'
 * 404:
 * description: Nie znaleziono mapy
 */
router.get('/:id', async (req, res) => {
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

/**
 * @swagger
 * /api/maps:
 * post:
 * summary: Tworzy nową mapę
 * tags: [Maps]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Map'
 * responses:
 * 201:
 * description: Pomyślnie utworzono mapę
 * 400:
 * description: Błąd w zapytaniu
 */
router.post('/', async (req, res) => {
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

/**
 * @swagger
 * /api/maps/{id}:
 * put:
 * summary: Aktualizuje istniejącą mapę
 * tags: [Maps]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: ID mapy do aktualizacji
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Map'
 * responses:
 * 200:
 * description: Zaktualizowana mapa
 * 404:
 * description: Nie znaleziono mapy
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedMap = await Map.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMap) {
      return res.status(404).json({ message: 'Nie znaleziono mapy o podanym ID' });
    }
    res.json(updatedMap);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/maps/{id}:
 * delete:
 * summary: Usuwa mapę i wszystkie powiązane z nią punkty
 * tags: [Maps]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: ID mapy do usunięcia
 * responses:
 * 200:
 * description: Potwierdzenie usunięcia
 * 404:
 * description: Nie znaleziono mapy
 */
router.delete('/:id', async (req, res) => {
  try {
    const map = await Map.findById(req.params.id);
    if (!map) {
      return res.status(404).json({ message: 'Nie znaleziono mapy' });
    }
    
    await Point.deleteMany({ map: map._id });
    
    await map.remove();
    res.json({ message: 'Pomyślnie usunięto mapę i wszystkie jej punkty' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
