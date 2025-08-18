import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css' // <-- CZY NA PEWNO MASZ TĘ LINIĘ?
import 'leaflet/dist/leaflet.css'; // <-- DODAJ TĘ LINIĘ

// ... reszta pliku
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
