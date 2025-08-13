const mongoose = require('mongoose');
const { Schema } = mongoose;

const mapSchema = new Schema({
  // Nazwa mapy, np. "Main Warehouse"
  name: {
    type: String,
    required: [true, 'Nazwa mapy jest wymagana.'],
    trim: true
  },
  // Opcjonalny opis mapy
  description: {
    type: String,
    required: false,
    trim: true
  },
  // Link do obrazu tła mapy
  imageUrl: {
    type: String,
    required: false
  },
  
  // --- RELACJE ---
  // Tablica przechowująca referencje (ID) do dokumentów Punktów
  points: [{
    type: Schema.Types.ObjectId,
    ref: 'Point' // Mówi Mongoose, że te ID odnoszą się do modelu 'Point'
  }],
  
  // Tablica przechowująca referencje (ID) do dokumentów Spacerów 3D
  walks3D: [{
    type: Schema.Types.ObjectId,
    ref: 'Walk3D' // Mówi Mongoose, że te ID odnoszą się do modelu 'Walk3D'
  }]
}, {
  // Opcja dodająca automatycznie pola `createdAt` i `updatedAt`
  timestamps: true
});

module.exports = mongoose.model('Map', mapSchema);