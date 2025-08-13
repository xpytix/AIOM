const mongoose = require('mongoose');
const { Schema } = mongoose;

const walk3DSchema = new Schema({
  // Nazwa spaceru, np. "Wirtualna trasa po parterze"
  name: {
    type: String,
    required: [true, 'Nazwa spaceru jest wymagana.'],
    trim: true
  },
  
  // Opcjonalny opis spaceru 3D
  description: {
    type: String,
    required: false,
    trim: true
  },

  // Główny URL do zasobu 3D. Może to być link do zewnętrznej usługi
  // (np. Matterport) lub do Twojej własnej implementacji (np. opartej o Photo Sphere Viewer).
  url: {
    type: String,
    required: false
  },

  // --- RELACJE ---
  
  // Referencja do mapy, do której przypisany jest ten spacer.
  // Każdy spacer musi należeć do jednej mapy.
  map: {
    type: Schema.Types.ObjectId,
    ref: 'Map',
    required: true,
    index: true // Indeks przyspieszy wyszukiwanie spacerów dla danej mapy
  },

  // Tablica referencji do punktów, które są częścią tego spaceru 3D.
  // Jest to relacja pomocnicza dla wygody (jak `points` w schemacie Map).
  points: [{
    type: Schema.Types.ObjectId,
    ref: 'Point'
  }]
}, {
  // Automatyczne daty utworzenia i modyfikacji
  timestamps: true
});

module.exports = mongoose.model('Walk3D', walk3DSchema);