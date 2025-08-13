const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express'); // Import Swagger UI
const swaggerSpecs = require('./swaggerConfig'); // Import naszej konfiguracji Swaggera

const app = express();
app.use(cors());
app.use(express.json());

// --- POŁĄCZENIE Z BAZĄ DANYCH ---
mongoose.connect('mongodb://localhost:27017/aiomDB');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Błąd połączenia z MongoDB:'));
db.once('open', () => {
  console.log('✅ Pomyślnie połączono z bazą danych MongoDB!');
});
// ------------------------------------

// --- SERWOWANIE DOKUMENTACJI SWAGGER ---
// Ten endpoint będzie hostował interaktywną dokumentację API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// ------------------------------------

// --- GŁÓWNA TRASA API ---
app.get('/', (req, res) => {
  res.json({ message: "Witaj w API do projektu AIOM!" });
});

// --- PODŁĄCZENIE ROUTERÓW ---
const pointTypesRouter = require('./routes/pointTypes');
app.use('/api/point-types', pointTypesRouter);

const mapsRouter = require('./routes/maps');
app.use('/api/maps', mapsRouter);

const pointsRouter = require('./routes/points');
app.use('/api/points', pointsRouter);

const walks3DRouter = require('./routes/walks3d');
app.use('/api/walks3d', walks3DRouter);
// -----------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serwer pomyślnie uruchomiony na porcie ${PORT}`);
});
