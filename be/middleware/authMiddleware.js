const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Strażnik 1: Sprawdza, czy użytkownik jest w ogóle zalogowany (czy ma ważny token)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Pobierz token z nagłówka (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      // Zweryfikuj token przy użyciu sekretu
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Znajdź użytkownika w bazie i dołącz go do obiektu req (bez hasła)
      // Dzięki temu w każdej chronionej trasie będziemy mieli dostęp do req.user
      req.user = await User.findById(decoded.user.id).select('-password');
      
      next(); // Przejdź do następnego kroku (kolejnego middleware lub właściwej funkcji trasy)
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Brak autoryzacji, token nieprawidłowy' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Brak autoryzacji, brak tokenu' });
  }
};

// Strażnik 2: Sprawdza, czy użytkownik ma jedną z wymaganych ról
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Dostęp zabroniony. Wymagana rola: ${roles.join(' lub ')}` });
    }
    next();
  };
};

module.exports = { protect, authorize };