<template>
    <!-- Komponent Transition dla płynnych animacji wejścia/wyjścia -->
    <Transition name="dialog-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[1000] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="dialogTitleId"
      >
        <!-- Półprzezroczyste tło (overlay) -->
        <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>
  
        <!-- Właściwy panel okna dialogowego -->
        <!-- ref="dialogPanel" jest potrzebny do zarządzania focusem -->
        <div 
          ref="dialogPanel"
          class="relative m-4 w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
        >
          <!-- Nagłówek -->
          <div class="flex items-start justify-between">
            <h3 :id="dialogTitleId" class="text-lg font-medium leading-6 text-gray-900">
              {{ title }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          
          <!-- Główna treść okna wstrzykiwana przez slot -->
          <div class="mt-4">
            <slot />
          </div>
  
          <!-- Stopka z przyciskami wstrzykiwana przez nazwany slot -->
          <div class="mt-6 flex justify-end gap-4">
            <slot name="footer">
              <button @click="closeModal">Zamknij</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
  
  const props = defineProps<{
    isOpen: boolean;
    title: string;
  }>();
  
  const emit = defineEmits<{
    (e: 'close'): void;
  }>();
  
  const dialogPanel = ref<HTMLElement | null>(null);
  const dialogTitleId = `dialog-title-${Math.random().toString(36).substring(2, 9)}`;
  
  const closeModal = () => {
    emit('close');
  };
  
  // --- Logika do obsługi klawiatury (Escape i Focus Trap) ---
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeModal();
    }
    if (event.key === 'Tab') {
      trapFocus(event);
    }
  };
  
  const trapFocus = (event: KeyboardEvent) => {
    if (!dialogPanel.value) return;
  
    const focusableElements = dialogPanel.value.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
  
    if (event.shiftKey) { // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  };
  
  // Obserwuj zmianę propa 'isOpen', aby włączyć/wyłączyć nasłuchiwanie
  watch(() => props.isOpen, (newValue) => {
    if (newValue) {
      document.addEventListener('keydown', handleKeyDown);
      // Ustaw fokus na pierwszym elemencie po otwarciu okna
      nextTick(() => {
        const firstFocusable = dialogPanel.value?.querySelector('a[href], button, textarea, input, select') as HTMLElement | null;
        firstFocusable?.focus();
      });
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });
  
  // Upewnij się, że listener zostanie usunięty, gdy komponent zniknie
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });
  </script>
  
  <style scoped>
  /* Definicje animacji dla komponentu Transition */
  .dialog-fade-enter-active,
  .dialog-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .dialog-fade-enter-from,
  .dialog-fade-leave-to {
    opacity: 0;
  }
  
  .dialog-fade-enter-active .relative,
  .dialog-fade-leave-active .relative {
    transition: all 0.3s ease;
  }
  .dialog-fade-enter-from .relative,
  .dialog-fade-leave-to .relative {
    transform: scale(0.95);
    opacity: 0;
  }
  </style>
  