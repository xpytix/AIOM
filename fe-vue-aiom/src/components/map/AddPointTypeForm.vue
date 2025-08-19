<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="flex items-start gap-4">
            <div class="flex-grow">
                <label for="point-type-name" class="block text-sm font-medium text-slate-700">Nazwa typu</label>
                <input id="point-type-name" v-model="formData.name" type="text" required
                    placeholder="np. Gaśnica proszkowa"
                    class="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600" />
            </div>
            <div>
                <label for="point-type-color" class="block text-sm font-medium text-slate-700">Kolor</label>
                <div class="relative mt-1 h-9 w-16 rounded-md border border-slate-300">
                    <input id="point-type-color" v-model="formData.color" type="color"
                        class="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                    <div class="h-full w-full rounded-[6px]" :style="{ backgroundColor: formData.color }"></div>
                </div>
            </div>
        </div>

        <div>
            <label for="point-type-description" class="block text-sm font-medium text-slate-700">Opis
                (opcjonalnie)</label>
            <textarea id="point-type-description" v-model="formData.description" rows="2"
                placeholder="Dodatkowe informacje o tym typie punktu"
                class="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600"></textarea>
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700">Ikona</label>
            <p class="text-xs text-slate-500">Wybierz jedną z sugestii lub wklej własną nazwę.</p>

            <div class="mt-2 grid grid-cols-6 gap-2">
                <button v-for="icon in suggestedIcons" :key="icon.name" type="button" @click="formData.icon = icon.name"
                    :class="[
                        'flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all',
                        formData.icon === icon.name
                            ? 'border-primary-500 bg-primary-50 scale-110'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    ]" :title="icon.name">
                    <component :is="icon.component" class="h-6 w-6 text-slate-600" />
                </button>
            </div>

            <div class="mt-4">
                <div class="flex items-center">
                    <input v-model="formData.icon" type="text" placeholder="Wpisz nazwę ikony..."
                        class="block w-full rounded-l-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
                    <a href="https://heroicons.com/" target="_blank"
                        class="flex-shrink-0 inline-flex items-center rounded-r-md bg-slate-100 px-3 py-2 text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-200"
                        title="Przeglądaj ikony na Heroicons.com">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="h-5 w-5">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 4.5V6m0 0L10.5 8.25M13.5 6l3.75 2.25" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, markRaw, defineAsyncComponent } from 'vue';
import type { NewPointTypeData } from '@/services/pointTypesService';

// Dynamiczne importowanie ikon z biblioteki heroicons
const suggestedIcons = [
    { name: 'FireIcon', component: markRaw(defineAsyncComponent(() => import('@heroicons/vue/24/outline/FireIcon'))) },
    { name: 'PlusCircleIcon', component: markRaw(defineAsyncComponent(() => import('@heroicons/vue/24/outline/PlusCircleIcon'))) },
    { name: 'ExclamationTriangleIcon', component: markRaw(defineAsyncComponent(() => import('@heroicons/vue/24/outline/ExclamationTriangleIcon'))) },
    { name: 'VideoCameraIcon', component: markRaw(defineAsyncComponent(() => import('@heroicons/vue/24/outline/VideoCameraIcon'))) },
    { name: 'WrenchScrewdriverIcon', component: markRaw(defineAsyncComponent(() => import('@heroicons/vue/24/outline/WrenchScrewdriverIcon'))) },
    { name: 'ClipboardDocumentListIcon', component: markRaw(defineAsyncComponent(() => import('@heroicons/vue/24/outline/ClipboardDocumentListIcon'))) }
];

const emit = defineEmits<{
    (e: 'save', data: NewPointTypeData): void;
}>();

const formData = ref({
    name: '',
    description: '',
    icon: 'FireIcon', // Domyślna ikona
    color: '#ef4444', // Domyślny czerwony
});

const handleSubmit = () => {
    if (!formData.value.name) {
        alert('Nazwa typu jest wymagana.');
        return;
    }
    emit('save', { ...formData.value });
};

defineExpose({ submit: handleSubmit });
</script>