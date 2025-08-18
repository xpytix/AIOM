import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }, // Oznaczamy, że ta trasa wymaga logowania
    },
    // ... inne trasy, które również oznaczysz meta: { requiresAuth: true }
  ],
})

// Globalny "strażnik" nawigacji
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Jeśli trasa wymaga autoryzacji i użytkownik NIE jest zalogowany
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Przekieruj go na stronę logowania
    next({ name: 'login' })
  } else {
    // W przeciwnym wypadku, pozwól mu wejść
    next()
  }
})

export default router
