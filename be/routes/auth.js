const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/login
// @desc    Logowanie użytkownika i zwracanie tokenu
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Prosta walidacja po stronie serwera
  if (!email || !password) {
    return res.status(400).json({ message: 'Proszę podać email i hasło.' });
  }

  try {
    // 1. Sprawdź, czy użytkownik istnieje w bazie
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowe dane logowania.' }); // Celowo ogólny komunikat
    }

    // 2. Porównaj podane hasło z hashem w bazie danych
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowe dane logowania.' }); // Ten sam ogólny komunikat
    }

    // 3. Jeśli wszystko się zgadza, stwórz i podpisz token JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' }, // Token wygasa po 8 godzinach
      (err, token) => {
        if (err) throw err;
        // 4. Odeślij token do klienta
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Błąd serwera');
  }
});

module.exports = router;