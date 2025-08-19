<template>
    <div class="fixed bottom-6 right-6 z-[1000] flex flex-col-reverse items-center gap-4">
        <button @click="toggleMenu"
            class="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
            aria-label="Otwórz menu akcji" :aria-expanded="isOpen" title="Menu akcji">
            <Transition enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-0 rotate-45"
                enter-to-class="transform opacity-100 scale-100 rotate-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100 rotate-0"
                leave-to-class="transform opacity-0 scale-0 rotate-45">
                <svg v-if="isOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="absolute h-7 w-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </Transition>
            <Transition enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-0 -rotate-45"
                enter-to-class="transform opacity-100 scale-100 rotate-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100 rotate-0"
                leave-to-class="transform opacity-0 scale-0 -rotate-45">
                <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="absolute h-7 w-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Transition>
        </button>

        <TransitionGroup tag="div" v-if="isOpen" class="flex flex-col-reverse items-center gap-3"
            enter-active-class="transition ease-out duration-300"
            enter-from-class="transform opacity-0 scale-95 -translate-y-4"
            enter-to-class="transform opacity-100 scale-100 translate-y-0"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="transform opacity-100 scale-100 translate-y-0"
            leave-to-class="transform opacity-0 scale-95 -translate-y-4">

            <button key="add" @click="$emit('add')"
                class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-transform hover:scale-110 hover:bg-primary-600"
                aria-label="Dodaj nowy punkt" title="Dodaj punkt">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>

            <button key="addType" @click="$emit('addType')"
                class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-transform hover:scale-110 hover:bg-primary-600"
                aria-label="Zarządzaj typami punktów" title="Zarządzaj typami">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                </svg>
            </button>

            <button key="camera" @click="$emit('camera')"
                class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-transform hover:scale-110 hover:bg-primary-600"
                aria-label="Zrób zdjęcie" title="Zrób zdjęcie">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
            </button>

            <button key="edit" @click="$emit('edit')"
                class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-transform hover:scale-110 hover:bg-primary-600"
                aria-label="Edytuj element" title="Edytuj punkt">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
            </button>

        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Definiowanie zdarzeń, które komponent może emitować
const emit = defineEmits(['add', 'edit', 'camera', 'addType']);

// Stan do zarządzania widocznością menu akcji
const isOpen = ref(false);

// Funkcja do przełączania menu
const toggleMenu = () => {
    isOpen.value = !isOpen.value;
};
</script>