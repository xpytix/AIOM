<template>
    <div class="relative h-screen w-screen">

        <div v-if="isAddingPoint"
            class="pointer-events-none absolute top-4 left-1/2 z-[1010] -translate-x-1/2 transform rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-black/5 backdrop-blur-sm">
            Tryb Dodawania Punktu: wskaż punkt na mapie
        </div>

        <div id="map-container" class="absolute top-0 left-0 z-0 h-full w-full"></div>

        <div v-if="isAddingPoint" class="adding-point-overlay absolute inset-0 z-[1000] bg-slate-900/20"></div>


        <FloatingActionButton class="absolute bottom-24 right-4 z-[1000]" @add="handleAddNew" @edit="handleEdit"
            @camera="handleCamera" @addType="handleAddType" />

        <div class="absolute bottom-0 left-0 right-0 z-[1000] p-4">
            <div class="mx-auto flex max-w-md items-center justify-between gap-2 rounded-lg bg-white p-2 shadow-xl">
                <button class="flex-shrink-0 rounded-md p-2 hover:bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                <div class="h-6 w-px bg-slate-200"></div>
                <button @click="openMapDialog"
                    class="w-full truncate rounded-md p-2 text-center font-semibold hover:bg-slate-100">
                    <span class="text-slate-500">Mapa: </span>
                    {{ mapsStore.currentMap ? mapsStore.currentMap.name : 'Wybierz...' }}
                </button>
                <div class="h-6 w-px bg-slate-200"></div>
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
                    class="cursor-pointer rounded-md p-3 font-medium hover:bg-primary-100">
                    {{ map.name }}
                </li>
            </ul>
            <div v-else>Ładowanie listy map...</div>
            <template #footer>
                <button @click="closeMapDialog"
                    class="rounded-md bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300">Anuluj</button>
            </template>
        </BaseDialog>

        <BaseDialog :is-open="isAddPointDialogOpen" title="Dodaj nowy punkt kontrolny" @close="closeAddPointDialog">
            <AddPointForm v-if="newPointCoords" ref="addPointFormRef" :coordinates="newPointCoords"
                :map-id="mapsStore.currentMap!._id" @save="handleSavePoint" />

            <template #footer>
                <button @click="closeAddPointDialog"
                    class="rounded-md bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300">Anuluj</button>
                <button @click="submitAddPointForm"
                    class="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">Zapisz
                    punkt</button>
            </template>
        </BaseDialog>

        <BaseDialog :is-open="isAddPointTypeDialogOpen" title="Dodaj nowy typ punktu" @close="closeAddPointTypeDialog">
            <AddPointTypeForm ref="addPointTypeFormRef" @save="handleSavePointType" />
            <template #footer>
                <button @click="closeAddPointTypeDialog"
                    class="rounded-md bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300">Anuluj</button>
                <button @click="submitAddPointTypeForm"
                    class="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">Zapisz typ</button>
            </template>
        </BaseDialog>
    </div>
</template>

<script setup lang="ts">// --- IMPORTY ---
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useMapsStore, type Map } from '@/stores/maps';
import { usePointsStore } from '@/stores/points';
import { usePointTypesStore } from '@/stores/pointTypes';
import type { NewPointData } from '@/services/pointService';
import L from 'leaflet';
import BaseDialog from '@/components/map/BaseDialog.vue';
import FloatingActionButton from '@/components/map/FloatingActionButton.vue';
import AddPointForm from '@/components/map/AddPointForm.vue';
import AddPointTypeForm from '@/components/map/AddPointTypeForm.vue'; // NOWY IMPORT
import type { NewPointTypeData } from '@/services/pointTypesService';


// --- STORES ---
const mapsStore = useMapsStore();
const pointsStore = usePointsStore();
const pointTypesStore = usePointTypesStore();

// --- ZMIENNE REAKTYWNE (STAN KOMPONENTU) ---
const mapInstance = ref<L.Map | null>(null);
const currentLayer = ref<L.Layer | null>(null);
const pointMarkersLayer = ref<L.LayerGroup | null>(null);
const isMapDialogOpen = ref(false);

// ZMIENNE DLA DODAWANIA PUNKTU
const isAddingPoint = ref(false);
const isAddPointDialogOpen = ref(false);
const newPointCoords = ref<{ lat: number; lng: number } | null>(null);
const addPointFormRef = ref<InstanceType<typeof AddPointForm> | null>(null);

// NOWE ZMIENNE DLA DODAWANIA TYPU PUNKTU
const isAddPointTypeDialogOpen = ref(false);
const addPointTypeFormRef = ref<InstanceType<typeof AddPointTypeForm> | null>(null);


// --- OBSŁUGA ZDARZEŃ UI ---
const openMapDialog = () => { isMapDialogOpen.value = true; };
const closeMapDialog = () => { isMapDialogOpen.value = false; };
const selectMap = (map: Map) => {
    mapsStore.setCurrentMap(map);
    closeMapDialog();
};

const handleEdit = () => { console.log('Akcja: Edytuj'); };
const handleCamera = () => { console.log('Akcja: Aparat'); };

// --- LOGIKA DODAWANIA NOWEGO PUNKTU ---

/** Rozpoczyna proces dodawania nowego punktu. */
const handleAddNew = () => {
    if (!mapsStore.currentMap) {
        alert('Najpierw wybierz mapę!');
        return;
    }
    isAddingPoint.value = true;
};

/** Anuluje tryb dodawania punktu. */
const cancelAddPoint = () => {
    isAddingPoint.value = false;
};

/** Obsługuje kliknięcie na mapie w trybie dodawania punktu. */
const onMapClick = (e: L.LeafletMouseEvent) => {
    if (!isAddingPoint.value) return;

    newPointCoords.value = { lat: e.latlng.lat, lng: e.latlng.lng };
    isAddPointDialogOpen.value = true;
    isAddingPoint.value = false;
};

/** Zamyka okno dialogowe dodawania punktu. */
const closeAddPointDialog = () => {
    isAddPointDialogOpen.value = false;
    newPointCoords.value = null;
};

/** Wywołuje zapisanie formularza z poziomu rodzica (dialogu). */
const submitAddPointForm = () => {
    addPointFormRef.value?.submit();
};

/** Obsługuje zdarzenie 'save' z formularza. */
const handleSavePoint = async (data: NewPointData) => {
    try {
        await pointsStore.addPoint(data);
        closeAddPointDialog();
    } catch (error) {
        console.error('Błąd zapisu punktu:', error);
        alert('Nie udało się zapisać punktu. Spróbuj ponownie.');
    }
};

// --- NOWA LOGIKA: DODAWANIE TYPU PUNKTU ---
const handleAddType = () => { isAddPointTypeDialogOpen.value = true; };
const closeAddPointTypeDialog = () => { isAddPointTypeDialogOpen.value = false; };
const submitAddPointTypeForm = () => { addPointTypeFormRef.value?.submit(); };
const handleSavePointType = async (data: NewPointTypeData) => {
    try {
        await pointTypesStore.addPointType(data);
        closeAddPointTypeDialog();
        // Można dodać toast 'Pomyślnie dodano nowy typ!'
    } catch (error) {
        console.error('Błąd zapisu typu punktu:', error);
        alert('Nie udało się zapisać typu punktu. Spróbuj ponownie.');
    }
};

// --- GŁÓWNA LOGIKA MAPY ---
const setupMapLayer = (mapData: Map) => {
    if (!mapInstance.value) return;
    const map = mapInstance.value;

    if (currentLayer.value) map.removeLayer(currentLayer.value);
    map.setMaxBounds(null);
    map.setMinZoom(0);

    if (mapData.mapType === 'image' && mapData.imageUrl) {
        map.options.crs = L.CRS.Simple;
        map.setView([0, 0], 1);
        const img = new Image();
        img.src = mapData.imageUrl;
        img.onload = () => {
            const w = img.naturalWidth, h = img.naturalHeight;
            const imageBounds = L.latLngBounds([[-h / 2, -w / 2], [h / 2, w / 2]]);
            const imageLayer = L.imageOverlay(mapData.imageUrl, imageBounds).addTo(map);
            currentLayer.value = imageLayer;
            map.setMinZoom(-2);
            map.fitBounds(imageBounds);
            const paddingFactor = 0.5;
            const paddedBounds = L.latLngBounds([[-h / 2 * (1 + paddingFactor), -w / 2 * (1 + paddingFactor)], [h / 2 * (1 + paddingFactor), w / 2 * (1 + paddingFactor)]]);
            map.setMaxBounds(paddedBounds);
        };
    } else {
        map.options.crs = L.CRS.EPSG3857;
        map.setView([mapData.initialView.lat, mapData.initialView.lng], mapData.initialView.zoom);
        const lat = mapData.initialView.lat, lng = mapData.initialView.lng;
        const corner1 = L.latLng(lat - 0.05, lng - 0.08);
        const corner2 = L.latLng(lat + 0.05, lng + 0.08);
        const bounds = L.latLngBounds(corner1, corner2);
        map.setMinZoom(12);
        map.setMaxBounds(bounds);
        const googleLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: 'Map data © Google' }).addTo(map);
        currentLayer.value = googleLayer;
    }
};

// --- CYKL ŻYCIA KOMPONENTU ---
onMounted(() => {
    mapInstance.value = L.map('map-container', { maxBoundsViscosity: 0.9, zoomControl: false });
    L.control.zoom({ position: 'topleft' }).addTo(mapInstance.value);
    pointMarkersLayer.value = L.layerGroup().addTo(mapInstance.value);

    mapInstance.value.on('click', onMapClick);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isAddingPoint.value) {
            cancelAddPoint();
        }
    });

    mapsStore.fetchMaps();
});

onBeforeUnmount(() => {
    if (mapInstance.value) {
        mapInstance.value.off('click', onMapClick);
        mapInstance.value.remove();
    }
});

// --- OBSERWATORY (WATCHERS) ---
watch(() => mapsStore.currentMap, (newMap) => {
    if (newMap && mapInstance.value) {
        setupMapLayer(newMap);
        pointsStore.fetchPointsForMap(newMap._id);
    }
});

// W pliku src/views/HomeView.vue

watch(() => pointsStore.points, (newPoints) => {
    if (!pointMarkersLayer.value || !mapInstance.value) return;

    // DODAJ TĘ LINIĘ:
    mapInstance.value.closePopup(); // Zamyka jakikolwiek otwarty dymek przed przerysowaniem

    pointMarkersLayer.value.clearLayers();
    newPoints.forEach(point => {
        L.marker([point.location.lat, point.location.lng])
            .addTo(pointMarkersLayer.value!)
            .bindPopup(`<b>${point.name}</b>`);
    });
}, { deep: true });

/** NOWY OBSERWATOR: Reaguje na zmianę trybu dodawania punktu i zmienia kursor. */
watch(isAddingPoint, (isAdding) => {
    if (!mapInstance.value) return;
    const mapContainer = mapInstance.value.getContainer(); // Pobieramy element DOM mapy

    if (isAdding) {
        mapContainer.style.cursor = 'crosshair'; // Ustawiamy kursor
    } else {
        mapContainer.style.cursor = ''; // Resetujemy kursor do domyślnego
    }
});
</script>

<style>
/* Dodajemy styl dla kursora, gdy jest aktywny tryb dodawania */
.cursor-crosshair {
    cursor: crosshair;
}

#map-container {
    height: 100vh;
}

.leaflet-control-container {
    z-index: 1010;
}

.leaflet-control-attribution {
    display: none !important;
}

.adding-point-overlay {
    pointer-events: none;
}
</style>