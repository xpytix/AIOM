<template>
    <!-- Tło i kontener centrujący dla modala -->
    <div class="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-50">
        <!-- Pudełko formularza -->
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 class="mb-4 text-xl font-bold">Dodaj Nowy Punkt</h2>
            <form @submit.prevent="handleSubmit">
                <!-- Nazwa Punktu -->
                <div class="mb-4">
                    <label for="point-name" class="mb-1 block text-sm font-medium">Nazwa punktu</label>
                    <input id="point-name" v-model="formData.name" type="text" required
                        class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600" />
                </div>

                <!-- Typ Punktu (Dropdown) -->
                <div class="mb-4">
                    <label for="point-type" class="mb-1 block text-sm font-medium">Typ punktu</label>
                    <select id="point-type" v-model="formData.pointType" required
                        class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600">
                        <option disabled value="">Wybierz typ...</option>
                        <option v-for="pt in pointTypesStore.pointTypes" :key="pt._id" :value="pt._id">
                            {{ pt.name }}
                        </option>
                    </select>
                </div>

                <!-- Przyciski -->
                <div class="mt-6 flex justify-end gap-4">
                    <button type="button" @click="$emit('cancel')" class="bg-slate-500 hover:bg-slate-600">
                        Anuluj
                    </button>
                    <button type="submit" class="bg-primary-600 hover:bg-primary-500">
                        Zapisz punkt
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePointTypesStore } from '@/stores/pointTypes';
import type { NewPointData } from '@/services/pointService';

// Definicja propsów i emitów
const props = defineProps<{
    coordinates: { lat: number; lng: number };
    mapId: string;
}>();

const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'save', data: NewPointData): void;
}>();

const pointTypesStore = usePointTypesStore();

const formData = ref({
    name: '',
    pointType: '',
});

// Po zamontowaniu komponentu, pobierz listę typów punktów
onMounted(() => {
    pointTypesStore.fetchPointTypes();
});

const handleSubmit = () => {
    if (!formData.value.name || !formData.value.pointType) {
        alert('Wypełnij wszystkie pola.');
        return;
    }

    const pointData: NewPointData = {
        name: formData.value.name,
        pointType: formData.value.pointType,
        map: props.mapId,
        location: props.coordinates,
        status: 'OK',
    };

    emit('save', pointData);
};
</script>
