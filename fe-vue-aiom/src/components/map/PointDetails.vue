<template>
    <div v-if="point" class="space-y-6">
        <!-- Sekcja z podstawowymi informacjami -->
        <div>
            <h3 class="text-xl font-bold text-slate-800">{{ point.name }}</h3>
            <p v-if="point.description" class="mt-1 text-sm text-slate-600">{{ point.description }}</p>
            <div class="mt-2 flex items-center gap-4 text-sm text-slate-500">
                <p>Status: <span class="font-semibold text-slate-700">{{ point.status }}</span></p>
                <div v-if="pointType" class="flex items-center gap-1.5">
                    <p>Typ:</p>
                    <span
                        class="flex h-6 items-center justify-center rounded-full px-3 text-xs font-semibold text-white"
                        :style="{ backgroundColor: pointType.color }">
                        {{ pointType.name }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Sekcja Inspekcji -->
        <div class="border-t border-slate-200 pt-4">
            <h4 class="text-lg font-semibold text-slate-700">Inspekcja</h4>
            <p class="text-sm text-slate-500 mt-2">
                Tutaj znajdą się informacje o ostatniej inspekcji oraz historia.
            </p>
            <button
                class="mt-3 w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">
                Wykonaj Inspekcję
            </button>
        </div>

        <!-- Sekcja Edycji -->
        <div class="border-t border-slate-200 pt-4">
            <h4 class="text-lg font-semibold text-slate-700">Zarządzanie</h4>
            <p class="text-sm text-slate-500 mt-2">
                Możliwość edycji lub usunięcia punktu.
            </p>
            <div class="mt-3 grid grid-cols-2 gap-3">
                <button
                    class="w-full rounded-md bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
                    Edytuj
                </button>
                <button
                    class="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                    Usuń
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePointTypesStore } from '@/stores/pointTypes';
import type { Point } from '@/services/pointService'; // Zaimportuj pełny typ Point

const props = defineProps<{
    point: Point; // Użyj pełnego typu Point
}>();

const pointTypesStore = usePointTypesStore();

// Znajduje pełne dane typu punktu na podstawie ID zapisanego w punkcie
const pointType = computed(() => {
    if (props.point && props.point.pointType) {
        return pointTypesStore.pointTypes.find(pt => pt._id === props.point.pointType);
    }
    return null;
});
</script>
```

---

### Krok 2: Zaktualizuj `HomeView.vue`

Teraz zintegrujemy nowy komponent i logikę z głównym widokiem mapy. Zastąp całą sekcję `
<script setup lang="ts">` w pliku `src/views/HomeView.vue`.


```typescript
// --- IMPORTY ---
import { onMounted, onBeforeUnmount, ref, watch, markRaw, nextTick } from 'vue';
import { useMapsStore, type Map } from '@/stores/maps';
import { usePointsStore, type Point } from '@/stores/points';
import { usePointTypesStore } from '@/stores/pointTypes';
import type { NewPointData } from '@/services/pointService';
import L from 'leaflet';
import BaseDialog from '@/components/map/BaseDialog.vue';
import FloatingActionButton from '@/components/map/FloatingActionButton.vue';
import AddPointForm from '@/components/map/AddPointForm.vue';
import AddPointTypeForm from '@/components/map/AddPointTypeForm.vue';
import PointDetails from '@/components/map/PointDetails.vue'; // NOWY IMPORT
import type { NewPointTypeData } from '@/services/pointTypesService';

// --- STORES ---
const mapsStore = useMapsStore();
const pointsStore = usePointsStore();
const pointTypesStore = usePointTypesStore();

// --- ZMIENNE REAKTYWNE (STAN KOMPONENTU) ---
const mapInstance = shallowRef<L.Map | null>(null);
const currentLayer = shallowRef<L.Layer | null>(null);
const pointMarkersLayer = shallowRef<L.LayerGroup | null>(null);
const isMapDialogOpen = ref(false);
const isAddingPoint = ref(false);
const isAddPointDialogOpen = ref(false);
const newPointCoords = ref<{ lat: number; lng: number } | null>(null);
const addPointFormRef = ref<InstanceType<typeof AddPointForm> | null>(null);
const isAddPointTypeDialogOpen = ref(false);
const addPointTypeFormRef = ref<InstanceType<typeof AddPointTypeForm> | null>(null);

// NOWE ZMIENNE DLA DIALOGU SZCZEGÓŁÓW
const isDetailsDialogOpen = ref(false);
const selectedPointForDetails = ref<Point | null>(null);


// --- OBSŁUGA ZDARZEŃ UI ---
const openMapDialog = () => { isMapDialogOpen.value = true; };
const closeMapDialog = () => { isMapDialogOpen.value = false; };
const selectMap = (map: Map) => {
    mapsStore.setCurrentMap(map);
    closeMapDialog();
};
const handleEdit = () => { console.log('Akcja: Edytuj'); };
const handleCamera = () => { console.log('Akcja: Aparat'); };
const handleAddType = () => { isAddPointTypeDialogOpen.value = true; };

// --- LOGIKA DODAWANIA PUNKTU ---
const handleAddNew = () => {
    if (!mapsStore.currentMap) {
        alert('Najpierw wybierz mapę!');
        return;
    }
    isAddingPoint.value = true;
};
const cancelAddPoint = () => { isAddingPoint.value = false; };
const onMapClick = (e: L.LeafletMouseEvent) => {
    if (!isAddingPoint.value) return;
    newPointCoords.value = { lat: e.latlng.lat, lng: e.latlng.lng };
    isAddPointDialogOpen.value = true;
    isAddingPoint.value = false;
};
const closeAddPointDialog = () => {
    isAddPointDialogOpen.value = false;
    newPointCoords.value = null;
};
const submitAddPointForm = () => { addPointFormRef.value?.submit(); };
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

// --- LOGIKA DODAWANIA TYPU PUNKTU ---
const closeAddPointTypeDialog = () => { isAddPointTypeDialogOpen.value = false; };
const submitAddPointTypeForm = () => { addPointTypeFormRef.value?.submit(); };
const handleSavePointType = async (data: NewPointTypeData) => {
    try {
        await pointTypesStore.addPointType(data);
        await pointTypesStore.fetchPointTypes();
        closeAddPointTypeDialog();
    } catch (error) {
        console.error('Błąd zapisu typu punktu:', error);
        alert('Nie udało się zapisać typu punktu. Spróbuj ponownie.');
    }
};

// --- NOWA LOGIKA: SZCZEGÓŁY PUNKTU ---
const openDetailsDialog = (point: Point) => {
    selectedPointForDetails.value = point;
    isDetailsDialogOpen.value = true;
};
const closeDetailsDialog = () => {
    isDetailsDialogOpen.value = false;
    selectedPointForDetails.value = null;
};


// --- GŁÓWNA LOGIKA MAPY ---
const setupMapLayer = (mapData: Map) => {
    // ... (bez zmian)
};

// --- CYKL ŻYCIA KOMPONENTU ---
onMounted(() => {
    const map = L.map('map-container', { maxBoundsViscosity: 0.9, zoomControl: false });
    mapInstance.value = markRaw(map);

    L.control.zoom({ position: 'topleft' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    pointMarkersLayer.value = markRaw(layerGroup);

    map.on('click', onMapClick);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isAddingPoint.value) {
            cancelAddPoint();
        }
    });

    mapsStore.fetchMaps();
    pointTypesStore.fetchPointTypes();
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

// ZMODYFIKOWANY OBSERWATOR PUNKTÓW
watch(() => pointsStore.points, (newPoints) => {
    if (!pointMarkersLayer.value || !mapInstance.value) return;

    mapInstance.value.closePopup();
    pointMarkersLayer.value.clearLayers();

    newPoints.forEach(point => {
        // Tworzymy unikalne ID dla elementu wewnątrz dymka
        const popupContentId = `popup-content-${point._id}`;
        // Tworzymy prosty HTML z przyciskiem/linkiem
        const popupHtml = `
            <div id="${popupContentId}" class="custom-popup-content">
                <b>${point.name}</b>
                <p class="text-xs text-slate-500 mt-1">Kliknij, aby zobaczyć szczegóły</p>
            </div>
        `;

        const marker = L.marker([point.location.lat, point.location.lng])
            .addTo(pointMarkersLayer.value!)
            .bindPopup(popupHtml);

        // Dodajemy listener na zdarzenie otwarcia dymka
        marker.on('popupopen', () => {
            // Czekamy na następny cykl renderowania, aby mieć pewność, że dymek jest w DOM
            nextTick(() => {
                const popupElement = document.getElementById(popupContentId);
                if (popupElement && !popupElement.dataset.listenerAttached) {
                    popupElement.addEventListener('click', () => {
                        openDetailsDialog(point);
                    });
                    // Oznaczamy, że listener został już dodany, aby uniknąć duplikatów
                    popupElement.dataset.listenerAttached = 'true';
                }
            });
        });
    });
}, { deep: true });


watch(isAddingPoint, (isAdding) => {
    if (!mapInstance.value) return;
    const mapContainer = mapInstance.value.getContainer();

    if (isAdding) {
        mapContainer.style.cursor = 'crosshair';
    } else {
        mapContainer.style.cursor = '';
    }
});
</script>
