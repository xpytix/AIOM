const mongoose = require('mongoose');
const { Schema } = mongoose;

const inspectionSchema = new Schema({
  // Referencja do punktu, którego dotyczy inspekcja
  point: {
    type: Schema.Types.ObjectId,
    ref: 'Point',
    required: true,
    index: true // Indeks przyspieszy wyszukiwanie inspekcji dla danego punktu
  },
  
  // Referencja do użytkownika, który przeprowadził inspekcję
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status punktu ZANIM została przeprowadzona inspekcja
  statusBefore: {
    type: String,
    required: true
  },
  
  // Status punktu PO przeprowadzeniu inspekcji
  statusAfter: {
    type: String,
    required: true
  },
  
  // Opcjonalne notatki lub komentarze z inspekcji
  notes: {
    type: String,
    trim: true
  }
}, {
  // `createdAt` będzie naszą oficjalną datą inspekcji
  timestamps: true
});

module.exports = mongoose.model('Inspection', inspectionSchema);