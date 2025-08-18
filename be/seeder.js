// be/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Map = require('./models/Map');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB połączone...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    
    // Czyścimy kolekcje przed importem
    await User.deleteMany();
    await Map.deleteMany();

    // --- Tworzenie Użytkownika Admina ---
    const adminUser = {
      name: 'Admin',
      email: 'admin@aiom.com',
      password: 'qwerty', // Pamiętaj, aby zmienić to na silne hasło!
      role: 'admin',
    };
    await User.create(adminUser);
    console.log('✅ Użytkownik admin został utworzony.');

    // --- Tworzenie Map ---
    const mapsToCreate = [
      // Mapa 1: Google Maps
      {
        name: "Saint Gobain - Stawiany (Google)",
        mapType: "google",
        initialView: {
          lat: 50.546009,
          lng: 20.613573,
          zoom: 15
        }
      },
      // Mapa 2: Twoja mapa z drona
      {
        name: "Twoja Mapa z Drona",
        mapType: "image",
        // Używamy bezpośredniego linku do obrazu .png
        imageUrl: "https://i.imgur.com/Rr9jBsZ.jpeg",
        initialView: {
          lat: 0,
          lng: 0,
          zoom: 1
        }
      }
    ];

    // Używamy insertMany do dodania wszystkich map naraz
    await Map.insertMany(mapsToCreate);
    console.log('✅ Dwie domyślne mapy zostały utworzone.');

    console.log('\n--- Import danych zakończony pomyślnie! ---');
    process.exit();
  } catch (error) {
    console.error(`BŁĄD: ${error}`);
    process.exit(1);
  }
};

// Uruchomienie skryptu
importData();
