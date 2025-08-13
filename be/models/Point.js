const mongoose = require('mongoose');
const { Schema } = mongoose;

const pointSchema = new Schema({
  // Nazwa punktu, np. "Gaśnica przy serwerowni"
  name: {
    type: String,
    required: [true, 'Nazwa punktu jest wymagana.'],
    trim: true
  },
  // Opcjonalny, dłuższy opis punktu
  description: {
    type: String,
    required: false,
    trim: true
  },
  // Status punktu, np. 'OK', 'Do przeglądu', 'Po terminie'
  status: {
    type: String,
    required: true,
    default: 'OK' // Domyślny status przy tworzeniu
  },

  // --- LOKALIZACJA ---
  // Przechowujemy współrzędne w zagnieżdżonym obiekcie
  location: {
    lat: { type: Number, required: true }, // Szerokość geograficzna lub współrzędna Y
    lng: { type: Number, required: true }  // Długość geograficzna lub współrzędna X
  },
  
  // --- RELACJE ---
  // Referencja do typu punktu, np. "Gaśnica", "Apteczka"
  pointType: {
    type: Schema.Types.ObjectId,
    ref: 'PointType', // Odnosi się do modelu 'PointType'
    required: true
  },
  
  // Referencja do mapy, do której należy ten punkt
  map: {
    type: Schema.Types.ObjectId,
    ref: 'Map', // Odnosi się do modelu 'Map'
    required: true
  },

  // Referencja do spaceru 3D, w którym ten punkt może się znajdować
  // Zgodnie z naszą ostatnią rozmową, punkt może należeć tylko do jednego spaceru
  walk3D: {
    type: Schema.Types.ObjectId,
    ref: 'Walk3D', // Odnosi się do modelu 'Walk3D'
    required: false // To pole jest opcjonalne
  }
}, {
  // Automatyczne daty utworzenia i modyfikacji
  timestamps: true
});

module.exports = mongoose.model('Point', pointSchema);