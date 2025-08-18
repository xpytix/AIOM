const express = require('express');
const router = express.Router();
const Inspection = require('../models/Inspection');
const Point = require('../models/Point');
const { protect } = require('../middleware/authMiddleware');
const PointType = require('../models/PointType'); // Dodaj import PointType

// --- Endpoint do tworzenia nowej inspekcji ---
router.post('/', protect, async (req, res) => {
  const { pointId, statusAfter, notes } = req.body;
  const userId = req.user.id;

  if (!pointId || !statusAfter) {
    return res.status(400).json({ message: 'Brak wymaganych pól: pointId i statusAfter' });
  }

  try {
    // 1. Znajdź punkt i powiązany z nim typ, aby poznać interwał
    const pointToInspect = await Point.findById(pointId).populate('pointType');
    if (!pointToInspect) {
      return res.status(404).json({ message: 'Nie znaleziono punktu o podanym ID' });
    }
    if (!pointToInspect.pointType) {
        return res.status(400).json({ message: 'Punkt nie ma przypisanego typu, nie można obliczyć interwału.' });
    }

    // 2. Stwórz nowy dokument inspekcji
    const newInspection = await Inspection.create({
      point: pointId,
      user: userId,
      statusBefore: pointToInspect.status,
      statusAfter: statusAfter,
      notes: notes
    });

    // 3. Oblicz datę następnej inspekcji
    const intervalDays = pointToInspect.pointType.inspectionIntervalInDays;
    const lastDate = new Date(); // Data dzisiejszej inspekcji
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + intervalDays);

    // 4. Zaktualizuj wszystkie potrzebne pola w dokumencie Punktu
    pointToInspect.status = statusAfter;
    pointToInspect.lastInspectionDate = lastDate;
    pointToInspect.nextInspectionDate = nextDate;
    await pointToInspect.save();

    res.status(201).json(newInspection);

  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera: ' + err.message });
  }
});

// --- Endpoint do pobierania historii inspekcji dla punktu ---
// @route   GET /api/inspections?pointId=...
// @desc    Pobiera listę wszystkich inspekcji dla danego punktu
// @access  Prywatny (wszyscy zalogowani)
router.get('/', protect, async (req, res) => {
  const { pointId } = req.query;

  if (!pointId) {
    return res.status(400).json({ message: 'Wymagany jest parametr "pointId"' });
  }

  try {
    const inspections = await Inspection.find({ point: pointId })
      .populate('user', 'name email') // Dołącz dane użytkownika (imię i email)
      .sort({ createdAt: -1 }); // Sortuj od najnowszej do najstarszej

    res.json(inspections);
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera: ' + err.message });
  }
});

module.exports = router;