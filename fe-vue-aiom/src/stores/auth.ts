import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import { jwtDecode } from 'jwt-decode'; // Będziemy potrzebować tej biblioteki

// Zainstaluj ją: npm install jwt-decode

interface User {
  id: string;
  role: 'admin' | 'manager' | 'inspector';
}

interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    // Przy starcie próbujemy załadować token z localStorage
    token: localStorage.getItem('authToken') || null,
    user: null, // Na start nie znamy usera, rozkodujemy go z tokenu
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
  },
  actions: {
    // Akcja logowania
    async login(credentials: { email: string; password: string }) {
      try {
        const { token } = await authService.login(credentials);
        this.token = token;
        
        // Zapisz token w localStorage, aby użytkownik był zalogowany po odświeżeniu strony
        localStorage.setItem('authToken', token);

        // Rozkoduj token, aby uzyskać dane użytkownika (id, role)
        const decodedToken: { user: User } = jwtDecode(token);
        this.user = decodedToken.user;
        
        // Po udanym logowaniu, przekieruj na stronę główną
        // (to zrobimy w komponencie lub w routerze)
        console.log('Zalogowano pomyślnie!');

      } catch (error) {
        console.error('Błąd logowania:', error);
        // Tutaj można obsłużyć błąd, np. wyświetlić komunikat
        throw error;
      }
    },
    
    // Akcja wylogowania
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('authToken');
      // Przekieruj na stronę logowania
      // (to zrobimy w komponencie lub w routerze)
      console.log('Wylogowano.');
    }
  }
});