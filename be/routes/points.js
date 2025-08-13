// const express = require('express');
// const router = express.Router();
// const Point = require('../models/Point');
// const Map = require('../models/Map');

// /**
//  * @swagger
//  * tags:
//  * name: Points
//  * description: API do zarządzania punktami na mapach
//  */

// // --- TRASY API DLA PUNKTÓW ---

// /**
//  * @swagger
//  * /api/points:
//  * get:
//  * summary: Pobiera listę wszystkich punktów
//  * tags: [Points]
//  * parameters:
//  * - in: query
//  * name: mapId
//  * schema:
//  * type: string
//  * required: false
//  * description: Opcjonalne ID mapy do filtrowania wyników
//  * responses:
//  * 200:
//  * description: Lista punktów
//  * content:
//  * application/json:
//  * schema:
//  * type: array
//  * items:
//  * $ref: '#/components/schemas/Point'
//  */
// router.get('/', async (req, res) => {
//   try {
//     const filter = req.query.mapId ? { map: req.query.mapId } : {};
//     const points = await Point.find(filter).populate('pointType', 'name icon');
//     res.json(points);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /api/points/{id}:
//  * get:
//  * summary: Pobiera jeden punkt po ID
//  * tags: [Points]
//  * parameters:
//  * - in: path
//  * name: id
//  * schema:
//  * type: string
//  * required: true
//  * description: ID punktu
//  * responses:
//  * 200:
//  * description: Dane punktu
//  * content:
//  * application/json:
//  * schema:
//  * $ref: '#/components/schemas/Point'
//  * 404:
//  * description: Nie znaleziono punktu
//  */
// router.get('/:id', async (req, res) => {
//   try {
//     const point = await Point.findById(req.params.id).populate('pointType').populate('map');
//     if (!point) {
//       return res.status(404).json({ message: 'Nie znaleziono punktu' });
//     }
//     res.json(point);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /api/points:
//  * post:
//  * summary: Tworzy nowy punkt
//  * tags: [Points]
//  * requestBody:
//  * required: true
//  * content:
//  * application/json:
//  * schema:
//  * $ref: '#/components/schemas/Point'
//  * responses:
//  * 201:
//  * description: Pomyślnie utworzono punkt
//  * 400:
//  * description: Błąd w zapytaniu
//  */
// router.post('/', async (req, res) => {
//   const point = new Point({
//     name: req.body.name,
//     description: req.body.description,
//     status: req.body.status,
//     location: req.body.location,
//     pointType: req.body.pointType,
//     map: req.body.map,
//     walk3D: req.body.walk3D
//   });

//   try {
//     const newPoint = await point.save();
//     await Map.findByIdAndUpdate(
//       newPoint.map,
//       { $push: { points: newPoint._id } }
//     );
//     res.status(201).json(newPoint);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /api/points/{id}:
//  * put:
//  * summary: Aktualizuje istniejący punkt
//  * tags: [Points]
//  * parameters:
//  * - in: path
//  * name: id
//  * schema:
//  * type: string
//  * required: true
//  * description: ID punktu do aktualizacji
//  * requestBody:
//  * required: true
//  * content:
//  * application/json:
//  * schema:
//  * $ref: '#/components/schemas/Point'
//  * responses:
//  * 200:
//  * description: Zaktualizowany punkt
//  * 404:
//  * description: Nie znaleziono punktu
//  */
// router.put('/:id', async (req, res) => {
//     try {
//         const updatedPoint = await Point.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedPoint) return res.status(404).json({ message: 'Nie znaleziono punktu' });
//         res.json(updatedPoint);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// /**
//  * @swagger
//  * /api/points/{id}:
//  * delete:
//  * summary: Usuwa punkt
//  * tags: [Points]
//  * parameters:
//  * - in: path
//  * name: id
//  * schema:
//  * type: string
//  * required: true
//  * description: ID punktu do usunięcia
//  * responses:
//  * 200:
//  * description: Potwierdzenie usunięcia
//  * 404:
//  * description: Nie znaleziono punktu
//  */
// router.delete('/:id', async (req, res) => {
//   try {
//     const point = await Point.findById(req.params.id);
//     if (!point) return res.status(404).json({ message: 'Nie znaleziono punktu' });
    
//     const mapId = point.map;
//     await point.remove();
//     await Map.findByIdAndUpdate(
//       mapId,
//       { $pull: { points: point._id } }
//     );
//     res.json({ message: 'Pomyślnie usunięto punkt i zaktualizowano mapę' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;
