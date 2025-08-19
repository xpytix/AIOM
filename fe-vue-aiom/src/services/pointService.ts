import apiClient from './apiClient'

// Tutaj w przyszłości zdefiniujemy pełny interfejs dla Punktu
export interface Point {
  _id: string
  name: string
  location: { lat: number; lng: number }
  // ... inne pola
}

export interface NewPointData {
  name: string
  description?: string // Opcjonalny
  map: string
  pointType: string
  location: { lat: number; lng: number }
  status: string
  photos?: File[] // Na razie opcjonalne, do obsługi w przyszłości
}

export const pointService = {
  // Pobiera punkty dla konkretnej mapy
  getPointsByMapId(mapId: string): Promise<Point[]> {
    return apiClient.get(`/points?mapId=${mapId}`).then((res) => res.data)
  },

  // Tworzy nowy punkt
  createPoint(data: NewPointData): Promise<Point> {
    return apiClient.post('/points', data).then((res) => res.data)
  },

  // W przyszłości: updatePoint, deletePoint...
}
