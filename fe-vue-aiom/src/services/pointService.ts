import apiClient from './apiClient'

// Pełny interfejs dla Punktu, zgodny z modelem w backendzie
export interface Point {
  _id: string
  name: string
  description?: string
  status: string
  location: { lat: number; lng: number }
  pointType: string // Przechowujemy tylko ID
  map: string
  // ... inne pola, które mogą dojść w przyszłości
}

// Interfejs dla danych nowego punktu
export interface NewPointData {
  name: string
  description?: string
  map: string
  pointType: string
  location: { lat: number; lng: number }
  status: string
  photos?: File[]
}

// Użyjemy Partial<Point>, aby umożliwić aktualizację tylko wybranych pól
export type UpdatePointData = Partial<Point>

export const pointService = {
  // Pobiera punkty dla konkretnej mapy
  getPointsByMapId(mapId: string): Promise<Point[]> {
    return apiClient.get(`/points?mapId=${mapId}`).then((res) => res.data)
  },

  // Tworzy nowy punkt
  createPoint(data: NewPointData): Promise<Point> {
    return apiClient.post('/points', data).then((res) => res.data)
  },

  // NOWA METODA: Aktualizuje istniejący punkt
  updatePoint(id: string, data: UpdatePointData): Promise<Point> {
    return apiClient.put(`/points/${id}`, data).then((res) => res.data)
  },

  // NOWA METODA: Usuwa punkt
  deletePoint(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/points/${id}`).then((res) => res.data)
  },
}
