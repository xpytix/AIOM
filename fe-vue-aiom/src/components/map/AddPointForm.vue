<template>
    <!-- Formularz bez dodatkowego tła, przeznaczony do umieszczenia wewnątrz modala -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Nazwa Punktu -->
        <div>
            <label for="point-name" class="block text-sm font-medium text-slate-700">Nazwa punktu</label>
            <input id="point-name" v-model="formData.name" type="text" required
                class="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600" />
        </div>

        <!-- Opis Punktu -->
        <div>
            <label for="point-description" class="block text-sm font-medium text-slate-700">Opis (opcjonalnie)</label>
            <textarea id="point-description" v-model="formData.description" rows="3"
                class="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600"></textarea>
        </div>

        <!-- Typ Punktu (Dropdown) -->
        <div>
            <label for="point-type" class="block text-sm font-medium text-slate-700">Typ punktu</label>
            <select id="point-type" v-model="formData.pointType" required
                class="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600">
                <option disabled value="">Wybierz typ...</option>
                <option v-for="pt in pointTypesStore.pointTypes" :key="pt._id" :value="pt._id">
                    {{ pt.name }}
                </option>
            </select>
        </div>

        <!-- Dodawanie Zdjęć -->
        <div>
            <label for="point-photos" class="block text-sm font-medium text-slate-700">Zdjęcia (opcjonalnie)</label>
            <input id="point-photos" type="file" multiple @change="handleFileChange"
                class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePointTypesStore } from '@/stores/pointTypes';
import type { NewPointData } from '@/services/pointService';

// Definicja propsów, które komponent przyjmuje z zewnątrz
const props = defineProps<{
    coordinates: { lat: number; lng: number };
    mapId: string;
}>();

// Definicja zdarzenia 'save', które komponent będzie emitował
const emit = defineEmits<{
    (e: 'save', data: NewPointData): void;
}>();

const pointTypesStore = usePointTypesStore();

// Stan formularza
const formData = ref({
    name: '',
    description: '',
    pointType: '',
    photos: [] as File[],
});

// Po zamontowaniu komponentu, pobierz listę typów punktów
onMounted(() => {
    pointTypesStore.fetchPointTypes();
});

// Obsługa zmiany plików w inpucie
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        formData.value.photos = Array.from(target.files);
    }
};

// Funkcja do walidacji i emisji danych - będzie wywoływana z zewnątrz
const handleSubmit = () => {
    if (!formData.value.name || !formData.value.pointType) {
        alert('Wypełnij wymagane pola (nazwa i typ).');
        return;
    }

    const pointData: NewPointData = {
        name: formData.value.name,
        description: formData.value.description,
        pointType: formData.value.pointType,
        map: props.mapId,
        location: props.coordinates,
        status: 'OK',
        // Uwaga: Przesyłanie plików wymaga osobnej logiki w backendzie (np. multer)
        // Na razie przekazujemy tylko informację o plikach
        photos: formData.value.photos,
    };

    emit('save', pointData);
};

// Umożliwiamy rodzicowi (HomeView) wywołanie naszej funkcji `handleSubmit`
defineExpose({
    submit: handleSubmit,
});
</script>
