const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware'); // Zaimportuj strażników

// POST /api/users - Tworzenie nowego użytkownika (tylko dla admina)
router.post('/', [protect, authorize('admin')], async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Użytkownik o tym adresie email już istnieje.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400).json({ message: 'Nieprawidłowe dane użytkownika.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NOWY KOD PONIŻEJ ---

// GET /api/users - Pobieranie wszystkich użytkowników (tylko dla admina)
router.get('/', [protect, authorize('admin')], async (req, res) => {
  try {
    // .select('-password') usuwa pole hasła z odpowiedzi dla bezpieczeństwa
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;