<template>
    <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
            <h1 class="mb-6 text-center text-2xl font-bold text-slate-800">
                Zaloguj się do AIOM
            </h1>
            <form @submit.prevent="handleLogin">
                <div class="mb-4">
                    <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Adres email</label>
                    <input id="email" v-model="email" type="email" required placeholder="ty@example.com"
                        class="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
                </div>
                <div class="mb-6">
                    <label for="password" class="mb-1 block text-sm font-medium text-slate-700">Hasło</label>
                    <input id="password" v-model="password" type="password" required
                        class="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
                </div>
                <button type="submit"
                    class="w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors duration-200 bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    Zaloguj się
                </button>
                <p v-if="errorMsg" class="mt-4 text-center text-sm text-red-600">
                    {{ errorMsg }}
                </p>
            </form>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const errorMsg = ref('');

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
    errorMsg.value = ''; // Resetuj komunikat błędu przy każdej próbie
    try {
        await authStore.login({ email: email.value, password: password.value });
        router.push('/');
    } catch (error) {
        errorMsg.value = 'Nieprawidłowy email lub hasło.';
    }
};
</script>