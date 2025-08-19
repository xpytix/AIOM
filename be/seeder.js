const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Map = require('./models/Map');
const PointType = require('./models/PointType'); // Import modelu PointType

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
    await PointType.deleteMany(); // Czyszczenie kolekcji typów punktów
    console.log('Kolekcje wyczyszczone...');

    // --- Tworzenie Użytkownika Admina ---
    const adminUser = {
      name: 'Admin',
      email: 'admin@aiom.com',
      password: 'qwerty',
      role: 'admin',
    };
    await User.create(adminUser);
    console.log('✅ Użytkownik admin został utworzony.');

    // --- Tworzenie Map ---
    const mapsToCreate = [
      {
        name: "Saint Gobain - Stawiany (Google)",
        mapType: "google",
        initialView: { lat: 50.546009, lng: 20.613573, zoom: 15 }
      },
      {
        name: "Mapa z Drona - Przykład",
        mapType: "image",
        imageUrl: "https://i.imgur.com/Rr9jBsZ.jpeg",
        initialView: { lat: 0, lng: 0, zoom: 1 }
      }
    ];
    await Map.insertMany(mapsToCreate);
    console.log('✅ Dwie domyślne mapy zostały utworzone.');

    // --- Tworzenie Typów Punktów ---
    const pointTypesToCreate = [
      {
        name: 'Gaśnica',
        description: 'Standardowa gaśnica proszkowa lub pianowa.',
        icon: 'FireIcon',
        color: '#ef4444' // Czerwony (Tailwind red-500)
      },
      {
        name: 'Apteczka',
        description: 'Punkt pierwszej pomocy medycznej.',
        icon: 'PlusCircleIcon',
        color: '#22c55e' // Zielony (Tailwind green-500)
      },
      {
        name: 'Kamera CCTV',
        description: 'Kamera monitoringu wizyjnego.',
        icon: 'VideoCameraIcon',
        color: '#3b82f6' // Niebieski (Tailwind blue-500)
      }
    ];
    await PointType.insertMany(pointTypesToCreate);
    console.log('✅ Trzy domyślne typy punktów zostały utworzone.');


    console.log('\n--- Import danych zakończony pomyślnie! ---');
    process.exit();
  } catch (error) {
    console.error(`BŁĄD: ${error}`);
    process.exit(1);
  }
};

// Uruchomienie skryptu
importData();
