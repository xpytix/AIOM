const mongoose = require('mongoose');
const { Schema } = mongoose;

const mapSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nazwa mapy jest wymagana.'],
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  // NOWE POLE: Typ mapy ('google' lub 'image')
  mapType: {
    type: String,
    enum: ['google', 'image'],
    required: true,
    default: 'google'
  },
  // Ten URL będzie używany tylko, gdy mapType to 'image'
  imageUrl: {
    type: String,
    required: function() { return this.mapType === 'image'; } // Wymagany tylko dla typu 'image'
  },
  // NOWY OBIEKT: Domyślny widok mapy przy załadowaniu
  initialView: {
    lat: { type: Number, required: true, default: 52.237 }, // Domyślnie Warszawa
    lng: { type: Number, required: true, default: 21.017 },
    zoom: { type: Number, required: true, default: 13 }
  },
  points: [{
    type: Schema.Types.ObjectId,
    ref: 'Point'
  }],
  walks3D: [{
    type: Schema.Types.ObjectId,
    ref: 'Walk3D'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Map', mapSchema);