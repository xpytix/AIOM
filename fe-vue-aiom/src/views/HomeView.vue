<template>
    <div class="relative h-screen w-screen">

        <aside class="absolute bottom-4 left-4 z-[1000] w-72 rounded-lg bg-white p-4 shadow-xl">
            <!-- Widok listy map (gdy nie dodajemy punktu) -->
            <div v-if="!isFormVisible">
                <h2 class="mb-4 text-lg font-bold">Wybierz Mapę</h2>
                <div v-if="mapsStore.isLoading">Ładowanie...</div>
                <ul v-else>
                    <li v-for="map in mapsStore.maps" :key="map._id" @click="mapsStore.setCurrentMap(map)"
                        class="cursor-pointer rounded-md p-2 hover:bg-primary-100"
                        :class="{ 'bg-primary-200 font-semibold': mapsStore.currentMap?._id === map._id }">
                        {{ map.name }}
                    </li>
                </ul>

                <div class="mt-4 border-t pt-4">
                    <button @click="toggleAddPointMode" :disabled="!mapsStore.currentMap"
                        :class="isAddingPoint ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-500'"
                        class="w-full disabled:bg-slate-300">
                        {{ isAddingPoint ? 'Anuluj dodawanie' : 'Dodaj nowy punkt' }}
                    </button>
                </div>
            </div>

            <!-- Widok formularza (gdy dodajemy punkt) -->
            <AddPointForm v-else-if="newPointCoords && mapsStore.currentMap" :coordinates="newPointCoords"
                :map-id="mapsStore.currentMap._id" @cancel="handleFormCancel" @save="handleFormSave" />
        </aside>

        <div id="map-container" class="absolute top-0 left-0 z-0 h-full w-full"
            :class="{ 'cursor-crosshair': isAddingPoint }"></div>

    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useMapsStore, type Map } from '@/stores/maps';
import { usePointsStore } from '@/stores/points';
import type { NewPointData } from '@/services/pointService';
import L from 'leaflet';
import AddPointForm from '@/components/map/AddPointForm.vue';

const mapsStore = useMapsStore();
const pointsStore = usePointsStore();

const mapInstance = ref<L.Map | null>(null);
const currentLayer = ref<L.Layer | null>(null);
const pointMarkersLayer = ref<L.LayerGroup | null>(null);
const isAddingPoint = ref(false);

const isFormVisible = ref(false);
const newPointCoords = ref<{ lat: number; lng: number } | null>(null);
const tempMarker = ref<L.Marker | null>(null); // Marker do wizualizacji nowego punktu

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

// Funkcja do czyszczenia tymczasowego markera
const removeTempMarker = () => {
    if (tempMarker.value && mapInstance.value?.hasLayer(tempMarker.value)) {
        mapInstance.value.removeLayer(tempMarker.value);
    }
    tempMarker.value = null;
};

const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!isAddingPoint.value) return;

    removeTempMarker(); // Usuń poprzedni tymczasowy marker, jeśli istnieje

    newPointCoords.value = e.latlng;

    // Stwórz i dodaj nowy tymczasowy marker w miejscu kliknięcia
    tempMarker.value = L.marker(e.latlng).addTo(mapInstance.value!);

    isFormVisible.value = true;
    isAddingPoint.value = false;
};

const toggleAddPointMode = () => {
    isAddingPoint.value = !isAddingPoint.value;
    // Jeśli anulujemy tryb dodawania, schowaj formularz i usuń marker
    if (!isAddingPoint.value) {
        handleFormCancel();
    }
};

const handleFormCancel = () => {
    isFormVisible.value = false;
    newPointCoords.value = null;
    removeTempMarker();
};

const handleFormSave = async (data: NewPointData) => {
    await pointsStore.addPoint(data);
    isFormVisible.value = false;
    newPointCoords.value = null;
    removeTempMarker();
};

onMounted(() => {
    mapInstance.value = L.map('map-container', { maxBoundsViscosity: 0.9 });
    pointMarkersLayer.value = L.layerGroup().addTo(mapInstance.value);
    mapInstance.value.on('click', handleMapClick);
    mapsStore.fetchMaps();
});

watch(() => mapsStore.currentMap, (newMap) => {
    if (newMap && mapInstance.value) {
        setupMapLayer(newMap);
        pointsStore.fetchPointsForMap(newMap._id);
        handleFormCancel(); // Ukryj formularz i wyczyść marker przy zmianie mapy
    }
});

watch(() => pointsStore.points, (newPoints) => {
    if (!pointMarkersLayer.value) return;
    pointMarkersLayer.value.clearLayers();
    newPoints.forEach(point => {
        L.marker([point.location.lat, point.location.lng])
            .addTo(pointMarkersLayer.value!)
            .bindPopup(`<b>${point.name}</b>`);
    });
});

onBeforeUnmount(() => {
    if (mapInstance.value) {
        mapInstance.value.off('click', handleMapClick);
        mapInstance.value.remove();
    }
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

.cursor-crosshair {
    cursor: crosshair !important;
}
</style>
