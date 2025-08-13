const mongoose = require('mongoose');
const { Schema } = mongoose;

const pointTypeSchema = new Schema({
  // Nazwa typu, np. "Gaśnica", "Apteczka", "Hydrant"
  name: {
    type: String,
    required: [true, 'Nazwa typu jest wymagana.'],
    unique: true, // Zapewnia, że nie będzie dwóch typów o tej samej nazwie
    trim: true
  },
  // Nazwa lub URL ikony do wyświetlenia na mapie
  icon: {
    type: String,
    required: false, // Ikona jest opcjonalna
    trim: true
  }
});

module.exports = mongoose.model('PointType', pointTypeSchema);