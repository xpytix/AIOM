// const express = require('express');
// const router = express.Router();
// const PointType = require('../models/PointType');

// /**
//  * @swagger
//  * tags:
//  * name: PointTypes
//  * description: API do zarządzania typami punktów
//  */

// // --- TRASY API ---

// /**
//  * @swagger
//  * /api/point-types:
//  * get:
//  * summary: Pobiera listę wszystkich typów punktów
//  * tags: [PointTypes]
//  * responses:
//  * 200:
//  * description: Lista typów punktów
//  * content:
//  * application/json:
//  * schema:
//  * type: array
//  * items:
//  * $ref: '#/components/schemas/PointType'
//  */
// router.get('/', async (req, res) => {
//   try {
//     const pointTypes = await PointType.find();
//     res.json(pointTypes);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /api/point-types:
//  * post:
//  * summary: Tworzy nowy typ punktu
//  * tags: [PointTypes]
//  * requestBody:
//  * required: true
//  * content:
//  * application/json:
//  * schema:
//  * $ref: '#/components/schemas/PointType'
//  * responses:
//  * 201:
//  * description: Pomyślnie utworzono typ punktu
//  * 400:
//  * description: Błąd w zapytaniu (np. nazwa nie jest unikalna)
//  */
// router.post('/', async (req, res) => {
//   const pointType = new PointType({
//     name: req.body.name,
//     icon: req.body.icon
//   });

//   try {
//     const newPointType = await pointType.save();
//     res.status(201).json(newPointType);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /api/point-types/{id}:
//  * get:
//  * summary: Pobiera jeden typ punktu po ID
//  * tags: [PointTypes]
//  * parameters:
//  * - in: path
//  * name: id
//  * schema:
//  * type: string
//  * required: true
//  * description: ID typu punktu
//  * responses:
//  * 200:
//  * description: Dane typu punktu
//  * content:
//  * application/json:
//  * schema:
//  * $ref: '#/components/schemas/PointType'
//  * 404:
//  * description: Nie znaleziono typu punktu
//  */
// router.get('/:id', async (req, res) => {
//     try {
//       const pointType = await PointType.findById(req.params.id);
//       if (!pointType) {
//         return res.status(404).json({ message: 'Nie znaleziono typu punktu o podanym ID' });
//       }
//       res.json(pointType);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });

// /**
//  * @swagger
//  * /api/point-types/{id}:
//  * put:
//  * summary: Aktualizuje istniejący typ punktu
//  * tags: [PointTypes]
//  * parameters:
//  * - in: path
//  * name: id
//  * schema:
//  * type: string
//  * required: true
//  * description: ID typu punktu do aktualizacji
//  * requestBody:
//  * required: true
//  * content:
//  * application/json:
//  * schema:
//  * $ref: '#/components/schemas/PointType'
//  * responses:
//  * 200:
//  * description: Zaktualizowany typ punktu
//  * 404:
//  * description: Nie znaleziono typu punktu
//  */
// router.put('/:id', async (req, res) => {
//     try {
//       const updatedPointType = await PointType.findByIdAndUpdate(
//         req.params.id, 
//         req.body, 
//         { new: true }
//       );
//       if (!updatedPointType) {
//         return res.status(404).json({ message: 'Nie znaleziono typu punktu o podanym ID' });
//       }
//       res.json(updatedPointType);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   });

// /**
//  * @swagger
//  * /api/point-types/{id}:
//  * delete:
//  * summary: Usuwa typ punktu
//  * tags: [PointTypes]
//  * parameters:
//  * - in: path
//  * name: id
//  * schema:
//  * type: string
//  * required: true
//  * description: ID typu punktu do usunięcia
//  * responses:
//  * 200:
//  * description: Potwierdzenie usunięcia
//  * 404:
//  * description: Nie znaleziono typu punktu
//  */
// router.delete('/:id', async (req, res) => {
//     try {
//       const pointType = await PointType.findById(req.params.id);
//       if (!pointType) {
//         return res.status(404).json({ message: 'Nie znaleziono typu punktu' });
//       }
  
//       await pointType.remove();
//       res.json({ message: 'Pomyślnie usunięto typ punktu' });
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });
  
// module.exports = router;
