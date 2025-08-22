<template>
  <BaseDialog :isOpen="isOpen" :title="dialogTitle" @close="handleClose">
    <div v-if="point" class="space-y-6">
      <!-- Tryb wyświetlania -->
      <template v-if="!isEditing">
        <div class="space-y-4">
          <!-- Podstawowe informacje -->
          <div>
            <h3 class="text-xl font-bold text-slate-800">{{ point.name }}</h3>
            <p v-if="point.description" class="mt-1 text-sm text-slate-600">{{ point.description }}</p>
            <div class="mt-2 flex items-center gap-4 text-sm text-slate-500">
              <p>Status: <span class="font-semibold text-slate-700">{{ point.status }}</span></p>
              <div v-if="pointType" class="flex items-center gap-1.5">
                <p>Typ:</p>
                <span
                  class="flex h-6 items-center justify-center rounded-full px-3 text-xs font-semibold text-white"
                  :style="{ backgroundColor: pointType.color }"
                >
                  {{ pointType.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Sekcja zdjęć -->
          <div class="border-t border-slate-200 pt-4">
            <h4 class="text-lg font-semibold text-slate-700">Zdjęcia</h4>
            <div class="mt-2 text-sm text-slate-500 bg-slate-100 p-4 rounded-lg text-center">
              Tutaj pojawi się galeria zdjęć punktu.
            </div>
          </div>

          <!-- Sekcja Inspekcji -->
          <div class="border-t border-slate-200 pt-4">
            <h4 class="text-lg font-semibold text-slate-700">Inspekcja</h4>
            <p class="text-sm text-slate-500 mt-2">
              Tutaj znajdą się informacje o ostatniej inspekcji oraz historia.
            </p>
            <button
              class="mt-3 w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
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
            <input type="text" id="point-name" v-model="editablePoint.name" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="point-description" class="block text-sm font-medium text-slate-700">Opis</label>
            <textarea id="point-description" v-model="editablePoint.description" rows="3" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
          </div>
          <div>
            <label for="point-type" class="block text-sm font-medium text-gray-700">Typ punktu</label>
            <select id="point-type" v-model="editablePoint.pointType" class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              <option v-for="pt in pointTypesStore.pointTypes" :key="pt._id" :value="pt._id">
                {{ pt.name }}
              </option>
            </select>
          </div>
        </form>
      </template>
    </div>

    <!-- Stopka z przyciskami -->
    <template #footer>
      <div class="flex w-full justify-between gap-3">
        <button v-if="!isEditing" @click="deletePoint" class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
          Usuń
        </button>
        <div v-else></div> <!-- Pusty div dla zachowania układu -->

        <div class="flex gap-3">
          <button @click="cancelEdit" class="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            {{ isEditing ? 'Anuluj' : 'Zamknij' }}
          </button>
          <button @click="toggleEditMode" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            {{ isEditing ? 'Zapisz' : 'Edytuj' }}
          </button>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue';
import { usePointTypesStore } from '@/stores/pointTypes';
import type { Point } from '@/services/pointService';
import BaseDialog from './BaseDialog.vue';


const props = defineProps<{
  isOpen: boolean;
  point: Point | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: Partial<Point>): void;
  (e: 'delete', id: string): void;
}>();

const pointTypesStore = usePointTypesStore();
const isEditing = ref(false);

// Kopia danych punktu do edycji
const editablePoint = ref<Partial<Point>>({});

// Obserwuje zmianę `point` z props i aktualizuje lokalną kopię do edycji
watch(() => props.point, (newPoint) => {
    console.log(point)
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
  if (props.point?.pointType) {
    const typeId = typeof props.point.pointType === 'string' ? props.point.pointType : (props.point.pointType as any)._id;
    return pointTypesStore.pointTypes.find(pt => pt._id === typeId);
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
    emit('save', editablePoint.value);
    isEditing.value = false;
  }
};

const deletePoint = () => {
  if (props.point && confirm(`Czy na pewno chcesz usunąć punkt "${props.point.name}"?`)) {
    emit('delete', props.point._id);
  }
}
</script>
