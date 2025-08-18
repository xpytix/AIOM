const mongoose = require('mongoose');

const pointTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String
  },
  // NOWE POLE: Interwał inspekcji w dniach
  inspectionIntervalInDays: {
    type: Number,
    required: [true, 'Interwał inspekcji jest wymagany.'],
    default: 365 // Domyślnie ustawiamy na rok
  }
});

module.exports = mongoose.model('PointType', pointTypeSchema);