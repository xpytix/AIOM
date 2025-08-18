// be/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

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
    // 1. Połącz z bazą danych
    await connectDB();
    
    // 2. Wyczyść kolekcję użytkowników (opcjonalne, ale dobre przy restarcie)
    await User.deleteMany();

    // 3. Zdefiniuj dane dla pierwszego admina
    const adminUser = {
      name: 'Admin',
      email: 'admin@aiom.com', // Zmień na prawdziwy email
      password: 'qwerty', // Użyj silnego, unikalnego hasła
      role: 'admin',
    };

    // 4. Stwórz użytkownika w bazie (hasło zostanie automatycznie zahashowane przez hook w modelu)
    await User.create(adminUser);

    console.log('✅ Dane zaimportowane! Użytkownik admin został utworzony.');
    process.exit();
  } catch (error) {
    console.error(`BŁĄD: ${error}`);
    process.exit(1);
  }
};

// Logika do uruchamiania z linii komend
importData();