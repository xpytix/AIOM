<template>
  <!-- Główny kontener, który zajmuje cały ekran i pozycjonuje elementy wewnątrz siebie -->
  <div class="relative h-screen w-screen">

    <!-- Pływający panel z przyciskami, wycentrowany na dole ekranu -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-72 rounded-lg bg-white p-4 shadow-xl">
      <!-- Przycisk otwierający okno dialogowe z wyborem mapy -->
      <button @click="openMapDialog" class="w-full text-left font-semibold">
        <span class="text-slate-500">Mapa: </span>
        <!-- Wyświetla nazwę aktualnej mapy lub tekst domyślny -->
        {{ mapsStore.currentMap ? mapsStore.currentMap.name : 'Wybierz mapę...' }}
      </button>

   
    </div>

    <!-- Kontener, w którym Leaflet będzie renderował mapę -->
    <div id="map-container" class="absolute top-0 left-0 z-0 h-full w-full"
         :class="{ 'cursor-crosshair': isAddingPoint }"></div>

    <!-- Komponent okna dialogowego do wyboru mapy -->
    <BaseDialog 
      :is-open="isMapDialogOpen" 
      title="Wybierz mapę do wyświetlenia"
      @close="closeMapDialog"
    >
      <!-- Treść okna dialogowego -->
      <ul v-if="!mapsStore.isLoading">
        <li v-for="map in mapsStore.maps" :key="map._id" @click="selectMap(map)"
            class="cursor-pointer rounded-md p-3 hover:bg-primary-100 font-medium">
          {{ map.name }}
        </li>
      </ul>
      <div v-else>Ładowanie listy map...</div>
      
      <!-- Stopka okna dialogowego z przyciskiem anulowania -->
      <template #footer>
        <button @click="closeMapDialog" class="bg-slate-200 text-slate-800 hover:bg-slate-300">Anuluj</button>
      </template>
    </BaseDialog>

  </div>
</template>

<script setup lang="ts">
// --- IMPORTY ---
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useMapsStore, type Map } from '@/stores/maps';
import { usePointsStore } from '@/stores/points';
import L from 'leaflet';
import BaseDialog from '@/components/map/BaseDialog.vue';

// --- STORES ---
const mapsStore = useMapsStore();
const pointsStore = usePointsStore();

// --- ZMIENNE REAKTYWNE (STAN KOMPONENTU) ---
const mapInstance = ref<L.Map | null>(null); // Przechowuje instancję mapy Leaflet
const currentLayer = ref<L.Layer | null>(null); // Przechowuje aktualnie wyświetlaną warstwę (Google lub obraz)
const pointMarkersLayer = ref<L.LayerGroup | null>(null); // Grupuje wszystkie znaczniki punktów
const isAddingPoint = ref(false); // Czy włączony jest tryb dodawania punktu (oczekiwanie na kliknięcie)
const isMapDialogOpen = ref(false); // Czy otwarte jest okno dialogowe wyboru mapy

// --- FUNKCJE OBSŁUGI OKNA DIALOGOWEGO Z MAPAMI ---
const openMapDialog = () => { isMapDialogOpen.value = true; };
const closeMapDialog = () => { isMapDialogOpen.value = false; };
const selectMap = (map: Map) => {
  mapsStore.setCurrentMap(map); // Ustawia wybraną mapę jako aktywną w store
  closeMapDialog(); // Zamyka okno dialogowe
};

// --- GŁÓWNA LOGIKA MAPY ---
/**
 * Konfiguruje i wyświetla odpowiednią warstwę na mapie (Google lub obraz).
 * @param mapData - Obiekt z danymi aktualnie wybranej mapy.
 */
const setupMapLayer = (mapData: Map) => {
  if (!mapInstance.value) return; // Zabezpieczenie, jeśli mapa nie jest jeszcze gotowa
  const map = mapInstance.value;

  // Czyszczenie przed dodaniem nowej warstwy
  if (currentLayer.value) map.removeLayer(currentLayer.value);
  map.setMaxBounds(null);
  map.setMinZoom(0);

  // Logika dla mapy typu 'image' (np. z drona)
  if (mapData.mapType === 'image' && mapData.imageUrl) {
    map.options.crs = L.CRS.Simple; // Używamy prostego systemu współrzędnych (x, y)
    map.setView([0, 0], 1); // Ustawiamy tymczasowy widok
    const img = new Image();
    img.src = mapData.imageUrl;
    img.onload = () => { // Czekamy na załadowanie obrazu, aby poznać jego wymiary
      const w = img.naturalWidth, h = img.naturalHeight;
      const imageBounds = L.latLngBounds([[-h / 2, -w / 2], [h / 2, w / 2]]);
      const imageLayer = L.imageOverlay(mapData.imageUrl, imageBounds).addTo(map);
      currentLayer.value = imageLayer;
      map.setMinZoom(-2); // Pozwalamy na duże oddalenie
      map.fitBounds(imageBounds); // Dopasowujemy widok do obrazu
      const paddingFactor = 0.5;
      const paddedBounds = L.latLngBounds([[-h/2 * (1+paddingFactor), -w/2 * (1+paddingFactor)], [h/2 * (1+paddingFactor), w/2 * (1+paddingFactor)]]);
      map.setMaxBounds(paddedBounds); // Ograniczamy przesuwanie do obszaru z buforem
    };
  } else { // Domyślna logika dla mapy Google
    map.options.crs = L.CRS.EPSG3857; // Używamy globalnego systemu współrzędnych
    map.setView([mapData.initialView.lat, mapData.initialView.lng], mapData.initialView.zoom);
    const lat = mapData.initialView.lat, lng = mapData.initialView.lng;
    const corner1 = L.latLng(lat - 0.05, lng - 0.08);
    const corner2 = L.latLng(lat + 0.05, lng + 0.08);
    const bounds = L.latLngBounds(corner1, corner2);
    map.setMinZoom(12); // Ograniczamy maksymalne oddalenie
    map.setMaxBounds(bounds); // Ograniczamy przesuwanie
    const googleLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: 'Map data © Google' }).addTo(map);
    currentLayer.value = googleLayer;
  }
};

// --- CYKL ŻYCIA KOMPONENTU (LIFECYCLE HOOKS) ---
onMounted(() => {
  // Inicjalizacja mapy Leaflet po zamontowaniu komponentu w DOM
  mapInstance.value = L.map('map-container', { maxBoundsViscosity: 0.9, zoomControl: false });
  // Przeniesienie kontrolek zoomu w prawy dolny róg
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.value);
  // Stworzenie warstwy do grupowania wszystkich znaczników punktów
  pointMarkersLayer.value = L.layerGroup().addTo(mapInstance.value);
  // Pobranie listy dostępnych map z API
  mapsStore.fetchMaps();
});

onBeforeUnmount(() => {
  // Sprzątanie po komponencie, aby uniknąć wycieków pamięci
  if (mapInstance.value) {
    mapInstance.value.remove(); // Usunięcie instancji mapy
  }
});

// --- OBSERWATORY (WATCHERS) ---
/** Reaguje na zmianę aktywnej mapy w store. */
watch(() => mapsStore.currentMap, (newMap) => {
  if (newMap && mapInstance.value) {
    setupMapLayer(newMap); // Ustawia nową warstwę mapy
    pointsStore.fetchPointsForMap(newMap._id); // Pobiera punkty dla nowej mapy
  }
});

/** Reaguje na zmianę listy punktów w store i aktualizuje znaczniki na mapie. */
watch(() => pointsStore.points, (newPoints) => {
  if (!pointMarkersLayer.value) return;
  pointMarkersLayer.value.clearLayers(); // Czyści wszystkie poprzednie znaczniki
  newPoints.forEach(point => {
    // Dla każdego punktu tworzy nowy znacznik i dodaje go do warstwy
    L.marker([point.location.lat, point.location.lng])
      .addTo(pointMarkersLayer.value!) // Dodajemy do warstwy, a nie bezpośrednio do mapy
      .bindPopup(`<b>${point.name}</b>`); // Dodaje prosty popup z nazwą
  });
});
</script>

<style>
#map-container { height: 100vh; }
.leaflet-control-container { z-index: 1010; }
.leaflet-control-attribution { display: none !important; }
/* Styl dla kursora w trybie dodawania punktu */
.cursor-crosshair { cursor: crosshair !important; }
</style>
