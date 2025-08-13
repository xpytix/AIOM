// const express = require('express');
// const router = express.Router();
// const Walk3D = require('../models/Walk3D');
// const Map = require('../models/Map');
// const Point = require('../models/Point');


// // --- TRASY API DLA SPACERÓW 3D ---

// /**
//  * @swagger
//  * tags:
//  * name: Walks3D
//  * description: API do zarządzania spacerami 3D
//  */

// /**
//  * @swagger
//  * /api/walks3d:
//  * get:
//  * summary: Pobiera listę wszystkich spacerów 3D
//  * tags: [Walks3D]
//  * parameters:
//  * - in: query
//  * name: mapId
//  * schema:
//  * type: string
//  * required: false
//  * description: Opcjonalne ID mapy do filtrowania wyników
//  * responses:
//  * 200:
//  * description: Lista spacerów 3D
//  * content:
//  * application/json:
//  * schema:
//  * type: array
//  * items:
//  * $ref: '#/components/schemas/Walk3D'
//  */
// router.get('/', async (req, res) => {
//   try {
//     const filter = req.query.mapId ? { map: req.query.mapId } : {};
//     const walks = await Walk3D.find(filter).populate('points');
//     res.json(walks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /api/walks3d/{id}:
//  * get:
//  * summary: Pobiera jeden spacer 3D po ID
//  * tags: [Walks3D]
//  * parameters:
//  * - in: path
//  * name: id
//  * schema:
//  * type: string
//  * required: true
//  * description: ID spaceru 3D
//  * responses:
//  * 200:
//  * description: Dane spaceru 3D
//  * content:
//  * application/json:
//  * schema:
//  * $ref: '#/components/schemas/Walk3D'
//  * 404:
//  * description: Nie znaleziono spaceru 3D
//  */
// router.get('/:id', async (req, res) => {
//   try {
//     const walk = await Walk3D.findById(req.params.id).populate('points');
//     if (!walk) {
//       return res.status(404).json({ message: 'Nie znaleziono spaceru 3D' });
//     }
//     res.json(walk);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /api/walks3d:
//  * post:
//  * summary: Tworzy nowy spacer 3D
//  * tags: [Walks3D]
//  * requestBody:
//  * required: true
//  * content:
//  * application/json:
//  * schema:
//  * $ref: '#/components/schemas/Walk3D'
//  * responses:
//  * 201:
//  * description: Pomyślnie utworzono spacer 3D
//  * 400:
//  * description: Błąd w zapytaniu
//  */
// router.post('/', async (req, res) => {
//   const walk = new Walk3D({
//     name: req.body.name,
//     description: req.body.description,
//     url: req.body.url,
//     map: req.body.map
//   });

//   try {
//     const newWalk = await walk.save();
//     await Map.findByIdAndUpdate(newWalk.map, { $push: { walks3D: newWalk._id } });
//     res.status(201).json(newWalk);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /api/walks3d/{id}:
//  * put:
//  * summary: Aktualizuje istniejący spacer 3D
//  * tags: [Walks3D]
//  * parameters:
//  * - in: path
//  * name: id
//  * schema:
//  * type: string
//  * required: true
//  * description: ID spaceru 3D do aktualizacji
//  * requestBody:
//  * required: true
//  * content:
//  * application/json:
//  * schema:
//  * $ref: '#/components/schemas/Walk3D'
//  * responses:
//  * 200:
//  * description: Zaktualizowany spacer 3D
//  * 404:
//  * description: Nie znaleziono spaceru 3D
//  */
// router.put('/:id', async (req, res) => {
//     try {
//         const updatedWalk = await Walk3D.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedWalk) return res.status(404).json({ message: 'Nie znaleziono spaceru 3D' });
//         res.json(updatedWalk);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// /**
//  * @swagger
//  * /api/walks3d/{id}:
//  * delete:
//  * summary: Usuwa spacer 3D
//  * tags: [Walks3D]
//  * parameters:
//  * - in: path
//  * name: id
//  * schema:
//  * type: string
//  * required: true
//  * description: ID spaceru 3D do usunięcia
//  * responses:
//  * 200:
//  * description: Potwierdzenie usunięcia
//  * 404:
//  * description: Nie znaleziono spaceru 3D
//  */
// router.delete('/:id', async (req, res) => {
//   try {
//     const walk = await Walk3D.findById(req.params.id);
//     if (!walk) return res.status(404).json({ message: 'Nie znaleziono spaceru 3D' });
    
//     await Map.findByIdAndUpdate(walk.map, { $pull: { walks3D: walk._id } });
//     await Point.updateMany({ _id: { $in: walk.points } }, { $set: { walk3D: null } });
//     await walk.remove();

//     res.json({ message: 'Pomyślnie usunięto spacer 3D i zaktualizowano relacje' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;
