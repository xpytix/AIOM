<template>
    <div class="relative h-screen w-screen">

        <div id="map-container" class="absolute top-0 left-0 z-0 h-full w-full"></div>

        <FloatingActionButton class="absolute bottom-24 right-4 z-[1000]" @add="handleAddNew" @edit="handleEdit"
            @camera="handleCamera" />

        <div class="absolute bottom-0 left-0 right-0 z-[1000] p-4">
            <div class="mx-auto flex max-w-md items-center justify-between gap-2 rounded-lg bg-white p-2 shadow-xl">

                <!-- Przycisk Ustawień z ikoną -->
                <button class="flex-shrink-0 rounded-md p-2 hover:bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                <!-- Separator -->
                <div class="h-6 w-px bg-slate-200"></div>

                <button @click="openMapDialog"
                    class="w-full truncate rounded-md p-2 text-center font-semibold hover:bg-slate-100">
                    <span class="text-slate-500">Mapa: </span>
                    {{ mapsStore.currentMap ? mapsStore.currentMap.name : 'Wybierz...' }}
                </button>

                <!-- Separator -->
                <div class="h-6 w-px bg-slate-200"></div>

                <!-- Przycisk Raportu z ikoną -->
                <button class="flex-shrink-0 rounded-md p-2 hover:bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2z" />
                    </svg>
                </button>
            </div>
        </div>

        <BaseDialog :is-open="isMapDialogOpen" title="Wybierz mapę do wyświetlenia" @close="closeMapDialog">
            <ul v-if="!mapsStore.isLoading">
                <li v-for="map in mapsStore.maps" :key="map._id" @click="selectMap(map)"
                    class="cursor-pointer rounded-md p-3 hover:bg-primary-100 font-medium">
                    {{ map.name }}
                </li>
            </ul>
            <div v-else>Ładowanie listy map...</div>

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
import FloatingActionButton from '@/components/map/FloatingActionButton.vue';

// --- STORES ---
const mapsStore = useMapsStore();
const pointsStore = usePointsStore();

// --- ZMIENNE REAKTYWNE (STAN KOMPONENTU) ---
const mapInstance = ref<L.Map | null>(null); // Przechowuje instancję mapy Leaflet
const currentLayer = ref<L.Layer | null>(null); // Przechowuje aktualnie wyświetlaną warstwę (Google lub obraz)
const pointMarkersLayer = ref<L.LayerGroup | null>(null); // Grupuje wszystkie znaczniki punktów
const isMapDialogOpen = ref(false); // Czy otwarte jest okno dialogowe wyboru mapy

// --- FUNKCJE OBSŁUGI ---
const openMapDialog = () => { isMapDialogOpen.value = true; };
const closeMapDialog = () => { isMapDialogOpen.value = false; };
const selectMap = (map: Map) => {
    mapsStore.setCurrentMap(map); // Ustawia wybraną mapę jako aktywną w store
    closeMapDialog(); // Zamyka okno dialogowe
};

const handleAddNew = () => {
    console.log('Akcja: Dodaj nowy punkt');
};
const handleEdit = () => { console.log('Akcja: Edytuj'); };
const handleCamera = () => { console.log('Akcja: Aparat'); };

// --- GŁÓWNA LOGIKA MAPY ---
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
            const paddedBounds = L.latLngBounds([[-h / 2 * (1 + paddingFactor), -w / 2 * (1 + paddingFactor)], [h / 2 * (1 + paddingFactor), w / 2 * (1 + paddingFactor)]]);
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
    // Przeniesienie kontrolek zoomu w lewy górny róg
    L.control.zoom({ position: 'topleft' }).addTo(mapInstance.value);
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
#map-container {
    height: 100vh;
}

.leaflet-control-container {
    z-index: 1010;
}

.leaflet-control-attribution {
    display: none !important;
}
</style>
