import apiClient from './apiClient'

interface PopulatedPointType {
  _id: string
  name: string
  color: string
  icon: string
}

// Pełny interfejs dla Punktu, zgodny z modelem w backendzie
export interface Point {
  _id: string
  name: string
  description?: string
  status: string
  location: { lat: number; lng: number }
  pointType: string | PopulatedPointType // Może być ID lub z-populate-owany obiekt
  map: string
  photos?: string[] // Tablica URL-i do zdjęć
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
  photos: File[]
}

// Użyjemy Partial<Point>, aby umożliwić aktualizację tylko wybranych pól
export type UpdatePointData = Partial<Point>

export const pointService = {
  // Pobiera punkty dla konkretnej mapy
  getPointsByMapId(mapId: string): Promise<Point[]> {
    return apiClient.get(`/points?mapId=${mapId}`).then((res) => res.data)
  },

  // NOWA METODA: Pobiera jeden punkt po ID z pełnymi danymi
  getPointById(id: string): Promise<Point> {
    return apiClient.get(`/points/${id}`).then((res) => res.data)
  },

  // Tworzy nowy punkt
  createPoint(data: NewPointData): Promise<Point> {
    const formData = new FormData()

    // Dodajemy wszystkie pola tekstowe i obiekty (po konwersji na string)
    formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    formData.append('map', data.map)
    formData.append('pointType', data.pointType)
    formData.append('status', data.status)
    formData.append('location', JSON.stringify(data.location))

    // Dodajemy pliki zdjęć
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photo) => {
        formData.append('photos', photo)
      })
    }

    // Wysłanie jako multipart/form-data
    return apiClient
      .post('/points', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data)
  },

  // NOWA METODA: Aktualizuje istniejący punkt
  updatePoint(id: string, data: UpdatePointData, newPhotos: File[] = []): Promise<Point> {
    const formData = new FormData()

    // Dodajemy pola tekstowe do FormData, jeśli istnieją w obiekcie `data`
    if (data.name !== undefined) formData.append('name', data.name)
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.status !== undefined) formData.append('status', data.status)
    if (data.pointType !== undefined) {
      // Przesyłamy tylko ID typu punktu, nawet jeśli w obiekcie jest cały obiekt
      const pointTypeId =
        typeof data.pointType === 'object'
          ? (data.pointType as PopulatedPointType)._id
          : data.pointType
      formData.append('pointType', pointTypeId)
    }

    // Dodajemy nowe pliki zdjęć
    if (newPhotos.length > 0) {
      newPhotos.forEach((photo) => {
        formData.append('photos', photo)
      })
    }

    return apiClient
      .put(`/points/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data)
  },

  // NOWA METODA: Usuwa punkt
  deletePoint(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/points/${id}`).then((res) => res.data)
  },

  // NOWA METODA: Usuwa zdjęcie z punktu
  deletePhoto(pointId: string, photoUrl: string): Promise<Point> {
    // Przekazujemy dane w obiekcie `data` dla metody delete
    return apiClient
      .delete(`/points/${pointId}/photo`, { data: { photoUrl } })
      .then((res) => res.data)
  },
}
