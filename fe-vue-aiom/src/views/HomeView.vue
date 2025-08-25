<template>
    <div class="relative h-screen w-screen">
        <!-- Komunikat informujący o trybie dodawania punktu -->
        <div v-if="isAddingPoint"
            class="pointer-events-none absolute top-4 left-1/2 z-[1010] -translate-x-1/2 transform rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-black/5 backdrop-blur-sm">
            Tryb Dodawania Punktu: wskaż punkt na mapie
        </div>

        <!-- Kontener na mapę Leaflet -->
        <div id="map-container" class="absolute top-0 left-0 z-0 h-full w-full"></div>

        <!-- Nakładka wizualna na czas dodawania punktu -->
        <div v-if="isAddingPoint" class="adding-point-overlay absolute inset-0 z-[1000] bg-slate-900/20"></div>

        <!-- Pływający przycisk akcji (FAB) -->
        <FloatingActionButton v-if="!isAddingPoint" class="absolute bottom-24 right-4 z-[1000]" @add="handleAddNew"
            @edit="handleEdit" @camera="handleCamera" @addType="handleAddType" />

        <!-- Dolny pasek z wyborem mapy -->
        <div class="absolute bottom-0 left-0 right-0 z-[1000] p-4" v-if="!isAddingPoint">
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

        <!-- Dialog wyboru mapy -->
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
                    class="rounded-md bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300">
                    Anuluj
                </button>
            </template>
        </BaseDialog>

        <!-- Dialog dodawania nowego punktu -->
        <BaseDialog :is-open="isAddPointDialogOpen" title="Dodaj nowy punkt kontrolny" @close="closeAddPointDialog">
            <AddPointForm v-if="newPointCoords" ref="addPointFormRef" :coordinates="newPointCoords"
                :map-id="mapsStore.currentMap!._id" @save="handleSavePoint" />

            <template #footer>
                <button @click="closeAddPointDialog"
                    class="rounded-md bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300">
                    Anuluj
                </button>
                <button @click="submitAddPointForm"
                    class="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
                    Zapisz punkt
                </button>
            </template>
        </BaseDialog>

        <!-- Dialog dodawania nowego typu punktu -->
        <BaseDialog :is-open="isAddPointTypeDialogOpen" title="Dodaj nowy typ punktu" @close="closeAddPointTypeDialog">
            <AddPointTypeForm ref="addPointTypeFormRef" @save="handleSavePointType" />
            <template #footer>
                <button @click="closeAddPointTypeDialog"
                    class="rounded-md bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300">
                    Anuluj
                </button>
                <button @click="submitAddPointTypeForm"
                    class="rounded-md bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300">
                    Zapisz typ
                </button>
            </template>
        </BaseDialog>

        <PointDetailsDialog :isOpen="isDetailsDialogOpen" :point="selectedPointForDetails" @close="closeDetailsDialog"
            @save="handleSavePointDetails" @delete="handleDeletePoint" @point-updated="onPointUpdated" />

    </div>
</template>

<script setup lang="ts">// --- IMPORTY ---
// Importy niezbędnych bibliotek, komponentów i typów.
import { useMapsStore, type Map } from '@/stores/maps';
import { usePointsStore } from '@/stores/points';
import { usePointTypesStore } from '@/stores/pointTypes';
import { pointService, type NewPointData, type Point } from '@/services/pointService';
import L from 'leaflet';
import BaseDialog from '@/components/map/BaseDialog.vue';
import FloatingActionButton from '@/components/map/FloatingActionButton.vue';
import AddPointForm from '@/components/map/AddPointForm.vue';
import AddPointTypeForm from '@/components/map/AddPointTypeForm.vue'; // NOWY IMPORT
import type { NewPointTypeData } from '@/services/pointTypesService';
import { onMounted, onBeforeUnmount, ref, watch, shallowRef, computed, nextTick } from 'vue';
import PointDetailsDialog from '@/components/map/PointDetailsDialog.vue';

// --- STORE'Y ---
// Inicjalizacja store'ów Pinia do zarządzania stanem aplikacji.
const mapsStore = useMapsStore();
const pointsStore = usePointsStore();
const pointTypesStore = usePointTypesStore();

// --- ZMIENNE REAKTYWNE (STAN KOMPONENTU) ---
// Przechowują instancje mapy, warstw oraz stany dialogów.
const mapInstance = shallowRef<L.Map | null>(null);
const currentLayer = shallowRef<L.Layer | null>(null);
const pointMarkersLayer = shallowRef<L.LayerGroup | null>(null);
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
// Funkcje odpowiedzialne za interakcje użytkownika z interfejsem.
const openMapDialog = () => {
    isMapDialogOpen.value = true; if (mapInstance.value) {
        mapInstance.value.closePopup(); // Zamyka jakikolwiek otwarty dymek przed przerysowaniem
    }
};
const closeMapDialog = () => { isMapDialogOpen.value = false; };
const selectMap = (map: Map) => {
    mapsStore.setCurrentMap(map);
    closeMapDialog();
};

// --- NOWA LOGIKA: SZCZEGÓŁY PUNKTU ---
const isDetailsDialogOpen = ref(false);
const selectedPointForDetails = ref<Point | null>(null);

const openDetailsDialog = async (point: Point) => {
    try {
        // Pobierz pełne dane punktu, zanim otworzysz dialog
        selectedPointForDetails.value = await pointService.getPointById(point._id);
    } catch (error) {
        console.error('Błąd podczas pobierania szczegółów punktu:', error);
        alert('Nie udało się pobrać szczegółów punktu. Spróbuj ponownie.');
        return;
    }

    isDetailsDialogOpen.value = true; // Otwórz dialog dopiero po pomyślnym pobraniu danych
};
const closeDetailsDialog = () => {
    isDetailsDialogOpen.value = false;
    selectedPointForDetails.value = null;
};

const handleSavePointDetails = async (data: Partial<Point>, newPhotos: File[] = []) => {
    if (!selectedPointForDetails.value) return;

    try {
        const updatedPoint = await pointsStore.updatePoint(selectedPointForDetails.value._id, data, newPhotos);
        // Zaktualizuj też `selectedPointForDetails`, aby pokazać nowe dane bez zamykania okna
        // Punkt zwrócony ze store jest już zaktualizowany i z-populate-owany przez backend.
        if (updatedPoint) {
            selectedPointForDetails.value = updatedPoint;
        } else {
            closeDetailsDialog();
        }
    } catch (error) {
        console.error('Błąd aktualizacji punktu:', error);
        alert('Nie udało się zaktualizować punktu. Spróbuj ponownie.');
    }
};

const onPointUpdated = (updatedPoint: Point) => {
    selectedPointForDetails.value = updatedPoint;
    pointsStore.localUpdatePoint(updatedPoint);
};

const handleDeletePoint = async (id: string) => {
    try {
        await pointsStore.deletePoint(id);
        if (mapsStore.currentMap) {
            await pointsStore.fetchPointsForMap(mapsStore.currentMap._id);
        }
        closeDetailsDialog();
    } catch (error) {
        console.error('Błąd usuwania punktu:', error);
        alert('Nie udało się usunąć punktu. Spróbuj ponownie.');
    }
};


// --- LOGIKA DODAWANIA NOWEGO PUNKTU ---
// Funkcje związane z procesem dodawania nowego punktu na mapie.
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
        if (mapsStore.currentMap) {
            await pointsStore.fetchPointsForMap(mapsStore.currentMap._id);
        }
        closeAddPointDialog();
    } catch (error) {
        console.error('Błąd zapisu punktu:', error);
        alert('Nie udało się zapisać punktu. Spróbuj ponownie.');
    }
};

// --- NOWA LOGIKA: DODAWANIE TYPU PUNKTU ---
// Funkcje do zarządzania typami punktów.
const handleAddType = () => { isAddPointTypeDialogOpen.value = true; };
const closeAddPointTypeDialog = () => { isAddPointTypeDialogOpen.value = false; };
const submitAddPointTypeForm = () => { addPointTypeFormRef.value?.submit(); };
const handleSavePointType = async (data: NewPointTypeData) => {
    try {
        await pointTypesStore.addPointType(data);
        // Odśwież listę typów, aby nowy typ był dostępny w formularzach
        await pointTypesStore.fetchPointTypes();
        closeAddPointTypeDialog();
        // Można dodać toast 'Pomyślnie dodano nowy typ!'
    } catch (error) {
        console.error('Błąd zapisu typu punktu:', error);
        alert('Nie udało się zapisać typu punktu. Spróbuj ponownie.');
    }
};

const handleEdit = () => { console.log('Akcja: Edytuj'); };
const handleCamera = () => { console.log('Akcja: Aparat'); };


// --- GŁÓWNA LOGIKA MAPY ---
// Funkcje odpowiedzialne za inicjalizację i zarządzanie warstwami mapy.
const setupMapLayer = (mapData: Map) => {
    if (!mapInstance.value) return;
    const map = mapInstance.value;

    if (currentLayer.value)
        map.removeLayer(currentLayer.value);


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

// --- HOOKI CYKLU ŻYCIA KOMPONENTU ---
// `onMounted` jest wywoływany po zamontowaniu komponentu w DOM.
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

// `onBeforeUnmount` jest wywoływany tuż przed odmontowaniem komponentu.
onBeforeUnmount(() => {
    if (mapInstance.value) {
        mapInstance.value.off('click', onMapClick);
        mapInstance.value.remove();
    }
});

// --- OBSERWATORY (WATCHERS) ---
// Obserwują zmiany w stanie i reagują na nie, np. aktualizując mapę.
watch(() => mapsStore.currentMap, (newMap) => {
    if (newMap && mapInstance.value) {
        mapInstance.value.closePopup(); // Zamyka jakikolwiek otwarty dymek przed przerysowaniem

        setupMapLayer(newMap);
        console.log('newMap', newMap);

        pointsStore.fetchPointsForMap(newMap._id);

    }
});

// Obserwator zmian w punktach na mapie.
watch(() => pointsStore.points, (newPoints) => {
    if (!pointMarkersLayer.value || !mapInstance.value) return

    // Zamknij otwarte dymki i wyczyść warstwę
    mapInstance.value.closePopup()
    pointMarkersLayer.value.clearLayers()

    newPoints.forEach((point) => {
        const pointType = point.pointType
        let marker

        // Sprawdź, czy mamy poprawny typ punktu z ikoną i kolorem, aby stworzyć niestandardowy marker
        if (pointType && typeof pointType === 'object' && pointType.icon && pointType.color) {
            // Konwertuj nazwę ikony z CamelCase (np. FireIcon) na kebab-case (np. fire)
            const iconFileName = pointType.icon
                .replace(/Icon$/, '')
                .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                .toLowerCase()
            const iconUrl = `/icons/${iconFileName}.svg`

            // --- DEBUGOWANIE ---
            console.log(`[Marker] Tworzenie ikony dla "${point.name}": ${iconUrl}`);

            const iconHtml = `
        <div class="custom-marker-pin" style="background-color: ${pointType.color};">
            <div class="custom-marker-icon" style="--icon-url: url('${iconUrl}')"></div>
        </div>
      `

            const customIcon = L.divIcon({
                html: iconHtml,
                className: '', // Usuwamy domyślne style Leaflet dla divIcon
                iconSize: [32, 40],
                iconAnchor: [16, 40], // Punkt "szpilki", który wskazuje na współrzędne
                popupAnchor: [0, -42], // Pozycja dymka względem iconAnchor
            })

            marker = L.marker([point.location.lat, point.location.lng], { icon: customIcon })
        } else {
            // Jeśli brak danych, użyj domyślnego markera Leaflet
            marker = L.marker([point.location.lat, point.location.lng])
        }

        // Tworzymy unikalne ID dla elementu wewnątrz dymka, aby go później znaleźć
        const popupContentId = `popup-content-${point._id}`

        // Tworzymy prosty HTML z tym unikalnym ID
        const popupHtml = `
            <div id="${popupContentId}" class="custom-popup-content cursor-pointer">
                <b class="text-base text-slate-800">${point.name}</b>
                <p class="text-xs text-slate-500 mt-1">Kliknij, aby zobaczyć szczegóły</p>
            </div>
        `

        marker.addTo(pointMarkersLayer.value!).bindPopup(popupHtml)

        // Dodajemy listener na zdarzenie otwarcia dymka przez Leaflet
        marker.on('popupopen', () => {
            // Czekamy na następny cykl renderowania, aby mieć pewność, że dymek jest w DOM
            nextTick(() => {
                const popupElement = document.getElementById(popupContentId)

                // Sprawdzamy, czy element istnieje i czy nie ma już podpiętego listenera
                if (popupElement && !popupElement.dataset.listenerAttached) {
                    popupElement.addEventListener('click', () => {
                        openDetailsDialog(point)
                    })
                    // Oznaczamy, że listener został już dodany, aby uniknąć duplikatów
                    popupElement.dataset.listenerAttached = 'true'
                }
            })
        })
    })
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

/* Style dla niestandardowych markerów */
.custom-marker-pin {
    width: 32px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    /* Tworzy kształt "szpilki" */
    clip-path: path('M16 40C16 40 4 24 4 16A12 12 0 1 1 28 16C28 24 16 40 16 40Z');
}

.custom-marker-icon {
    width: 20px;
    height: 20px;
    background: white;
    /* Użycie 'background' zamiast 'background-color' bywa bardziej niezawodne z maskowaniem */
    /* Używamy skróconej właściwości 'mask' i zmiennej CSS dla lepszej kompatybilności */
    mask: var(--icon-url) center / contain no-repeat;
    -webkit-mask: var(--icon-url) center / contain no-repeat;
    margin-bottom: 10px;
    /* Dopasowanie pozycji ikony wewnątrz "szpilki" */
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