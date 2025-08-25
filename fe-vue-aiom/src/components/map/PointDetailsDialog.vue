<template>
    <BaseDialog :isOpen="isOpen" :title="dialogTitle" @close="handleClose">
        <div v-if="point" class="space-y-6">
            <!-- Tryb wyświetlania -->
            <template v-if="!isEditing">
                <div class="space-y-4">
                    <!-- Podstawowe informacje -->
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">Nazwa: {{ point.name }}</h3>
                        <p v-if="point.description" class="mt-1 text-sm text-slate-600">Opis: {{ point.description }}
                        </p>
                        <div class="mt-2 flex items-center gap-4 text-sm text-slate-500">
                            <p>Status: <span class="font-semibold text-slate-700">{{ point.status }}</span></p>
                            <div v-if="pointType" class="flex items-center gap-1.5">
                                <p>Typ:</p>
                                <span :style="{ backgroundColor: pointType.color }"
                                    class="flex h-6 items-center justify-center rounded-full px-3 text-xs font-semibold"
                                    :class="getTextColor(pointType.color)">
                                    {{ pointType.name }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Sekcja zdjęć -->
                    <div class="border-t border-slate-200 pt-4">
                        <h4 class="text-lg font-semibold text-slate-700">Zdjęcia</h4>
                        <div v-if="point.photos && point.photos.length > 0"
                            class="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3">
                            <div v-for="(photoUrl, index) in point.photos" :key="index" class="relative">
                                <img @click="openPreview(photoUrl)" :src="`http://localhost:5000${photoUrl}`"
                                    :alt="`Zdjęcie ${index + 1} dla ${point.name}`"
                                    class="h-32 w-full cursor-pointer rounded-lg object-cover shadow-md transition-transform hover:scale-105" />
                            </div>
                        </div>
                        <div v-else class="mt-2 rounded-lg bg-slate-100 p-4 text-center text-sm text-slate-500">
                            Brak zdjęć dla tego punktu.
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
                </div>
            </template>

            <!-- Tryb edycji -->
            <template v-else>
                <form @submit.prevent="saveChanges" class="space-y-4">
                    <div>
                        <label for="point-name" class="block text-sm font-medium text-slate-700">Nazwa</label>
                        <input type="text" id="point-name" v-model="editablePoint.name"
                            class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="point-description" class="block text-sm font-medium text-slate-700">Opis</label>
                        <textarea id="point-description" v-model="editablePoint.description" rows="3"
                            class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <label for="point-type" class="block text-sm font-medium text-gray-700">Typ punktu</label>
                        <select id="point-type" v-model="editablePoint.pointType"
                            class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                            <option v-for="pt in pointTypesStore.pointTypes" :key="pt._id" :value="pt._id">
                                {{ pt.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Sekcja edycji zdjęć -->
                    <div class="border-t border-slate-200 pt-4">
                        <h4 class="text-lg font-semibold text-slate-700">Zarządzaj zdjęciami</h4>
                        <div v-if="editablePoint.photos && editablePoint.photos.length > 0"
                            class="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3">
                            <div v-for="(photoUrl, index) in editablePoint.photos" :key="index" class="group relative">
                                <img :src="`http://localhost:5000${photoUrl}`" :alt="`Zdjęcie ${index + 1}`"
                                    class="h-32 w-full rounded-lg object-cover shadow-md" />
                                <button @click.prevent="handleDeletePhoto(photoUrl)"
                                    class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/80 text-white opacity-0 transition hover:bg-red-700 group-hover:opacity-100"
                                    title="Usuń zdjęcie">
                                    <span class="text-xl font-bold leading-none">&times;</span>
                                </button>
                            </div>
                        </div>
                        <div v-else class="mt-2 rounded-lg bg-slate-100 p-4 text-center text-sm text-slate-500">
                            Brak zdjęć.
                        </div>
                        <div class="mt-4">
                            <label for="point-photos-edit" class="block text-sm font-medium text-slate-700">Dodaj nowe
                                zdjęcia ({{ photoCount }}/6)</label>
                            <input id="point-photos-edit" type="file" multiple @change="handleFileChange"
                                :disabled="photoCount >= 6"
                                class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50" />
                        </div>
                    </div>
                </form>
            </template>
        </div>

        <!-- Stopka z przyciskami -->
        <template #footer>
            <div class="flex w-full justify-between gap-3">
                <button @click="cancelEdit" class="rounded-md bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300">
                    {{ isEditing ? 'Anuluj' : 'Zamknij' }}
                </button>

                <div class="flex gap-3">

                    <button v-if="!isEditing" @click="deletePoint"
                        class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                        Usuń
                    </button>
                    <button @click="toggleEditMode"
                        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        {{ isEditing ? 'Zapisz' : 'Edytuj' }}
                    </button>

                </div>
            </div>
        </template>

        <!-- Podgląd zdjęcia -->
        <Transition name="dialog-fade">
            <div v-if="isPreviewOpen" @click="closePreview"
                class="fixed inset-0 z-[1001] flex cursor-pointer items-center justify-center bg-black/80 p-4">
                <img :src="previewImageUrl!" @click.stop class="max-h-full max-w-full rounded-lg shadow-2xl"
                    alt="Podgląd zdjęcia" />
            </div>
        </Transition>
    </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue';
import { usePointTypesStore } from '@/stores/pointTypes';
import { pointService, type Point } from '@/services/pointService';
import BaseDialog from './BaseDialog.vue';

const props = defineProps<{
    isOpen: boolean;
    point: Point | null;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', data: Partial<Point>, newPhotos: File[]): void;
    (e: 'delete', id: string): void;
    (e: 'point-updated', point: Point): void;
}>();

const pointTypesStore = usePointTypesStore();
const isEditing = ref(false);

// Stan dla podglądu zdjęć
const isPreviewOpen = ref(false);
const previewImageUrl = ref<string | null>(null);

// Kopia danych punktu do edycji
const editablePoint = ref<Partial<Point>>({});
const newPhotosToUpload = ref<File[]>([]);

// Obserwuje zmianę `point` z props i aktualizuje lokalną kopię do edycji
watch(() => props.point, (newPoint) => {

    if (newPoint) {
        const rawPoint = toRaw(newPoint);
        editablePoint.value = structuredClone(rawPoint);

        // NAPRAWA: Upewnij się, że `pointType` to zawsze ID w trybie edycji
        if (typeof rawPoint.pointType === 'object' && rawPoint.pointType !== null) {
            editablePoint.value.pointType = (rawPoint.pointType as any)._id;
        }
    } else {
        editablePoint.value = {};
    }
}, { immediate: true, deep: true });

const dialogTitle = computed(() => {
    if (!props.point) return '';
    return isEditing.value ? `Edytuj: ${props.point.name}` : props.point.name;
});

// Ta funkcja computed poprawnie znajduje obiekt typu na podstawie ID
const pointType = computed(() => {
    if (props.point?.pointType && typeof props.point.pointType === 'object') {
        // Zwróć bezpośrednio z-populate-owany obiekt
        return props.point.pointType as any;
    }
    return null;
});

const handleClose = () => {
    isEditing.value = false;
    emit('close');
};

const toggleEditMode = () => {
    if (isEditing.value) {
        saveChanges();
    } else {
        isEditing.value = true;
    }
};

const cancelEdit = () => {
    if (isEditing.value) {
        isEditing.value = false;
        newPhotosToUpload.value = []; // Zresetuj nowe pliki przy anulowaniu
        if (props.point) {
            // Przywróć oryginalne dane, również dbając o ID typu punktu
            const rawPoint = toRaw(props.point);
            editablePoint.value = structuredClone(rawPoint);
            if (typeof rawPoint.pointType === 'object' && rawPoint.pointType !== null) {
                editablePoint.value.pointType = (rawPoint.pointType as any)._id;
            }
        }
    } else {
        handleClose();
    }
};

const saveChanges = () => {
    if (props.point) {
        emit('save', editablePoint.value, newPhotosToUpload.value);
        isEditing.value = false;
        newPhotosToUpload.value = []; // Zresetuj po zapisie
    }
};

const deletePoint = () => {
    if (props.point && confirm(`Czy na pewno chcesz usunąć punkt "${props.point.name}"?`)) {
        emit('delete', props.point._id);
    }
}

// --- LOGIKA ZDJĘĆ ---

const openPreview = (url: string) => {
    previewImageUrl.value = `http://localhost:5000${url}`;
    isPreviewOpen.value = true;
};

const closePreview = () => {
    isPreviewOpen.value = false;
    previewImageUrl.value = null;
};

const handleDeletePhoto = async (photoUrl: string) => {
    if (!props.point) return;
    if (!confirm('Czy na pewno chcesz usunąć to zdjęcie? Tej operacji nie można cofnąć.')) {
        return;
    }
    try {
        // Wywołaj serwis, aby usunąć zdjęcie na backendzie
        const updatedPoint = await pointService.deletePhoto(props.point._id, photoUrl);
        // Zaktualizuj stan w komponencie nadrzędnym przez dedykowane zdarzenie
        emit('point-updated', updatedPoint);
    } catch (error) {
        console.error('Błąd podczas usuwania zdjęcia:', error);
        alert('Nie udało się usunąć zdjęcia.');
    }
};

const photoCount = computed(() => {
    const existing = editablePoint.value.photos?.length || 0;
    const toAdd = newPhotosToUpload.value.length;
    return existing + toAdd;
});

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        const files = Array.from(target.files);
        if ((editablePoint.value.photos?.length || 0) + files.length > 6) {
            alert('Punkt może mieć maksymalnie 6 zdjęć.');
            target.value = ''; // Wyczyść input
            return;
        }
        newPhotosToUpload.value = files;
    }
};

// Prosta funkcja do określenia koloru tekstu na podstawie tła
const getTextColor = (bgColor: string) => {
    if (!bgColor) return 'text-white';
    const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? 'text-slate-800' : 'text-white';
};

</script>
