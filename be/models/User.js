const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Imię jest wymagane.'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Adres email jest wymagany.'],
    unique: true, // Każdy email musi być unikalny
    trim: true,
    lowercase: true, // Zawsze zapisuj email małymi literami
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Proszę podać prawidłowy adres email.']
  },
  password: {
    type: String,
    required: [true, 'Hasło jest wymagane.'],
    minlength: 6 // Minimalna długość hasła
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'manager', 'inspector'], // Tylko te wartości są dozwolone
    default: 'inspector' // Domyślna rola, jeśli nie zostanie podana
  }
}, { timestamps: true });

// "Hook" - funkcja, która uruchamia się automatycznie PRZED zapisaniem użytkownika
userSchema.pre('save', async function(next) {
  // Haszuj hasło tylko wtedy, gdy jest modyfikowane (lub jest nowe)
  if (!this.isModified('password')) {
    return next();
  }

  // Generuj "sól" i haszuj hasło
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);