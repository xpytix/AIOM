import axios from 'axios'

// Konfigurujemy bazowy URL dla zapytań
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authService = {
  login(credentials: { email: string; password: string }): Promise<{ token: string }> {
    // Wysyłamy zapytanie POST na /api/auth/login z danymi użytkownika
    return apiClient.post('/auth/login', credentials).then((response) => response.data)
  },
}
