import { defineStore } from 'pinia'
import { pointService, type Point, type NewPointData } from '@/services/pointService'

interface PointsState {
  points: Point[]
  isLoading: boolean
}

export const usePointsStore = defineStore('points', {
  state: (): PointsState => ({
    points: [],
    isLoading: false,
  }),
  actions: {
    // Akcja do pobierania punktów dla mapy
    async fetchPointsForMap(mapId: string) {
      this.isLoading = true
      try {
        this.points = await pointService.getPointsByMapId(mapId)
      } catch (error) {
        console.error('Błąd podczas pobierania punktów:', error)
        this.points = [] // Wyczyść punkty w razie błędu
      } finally {
        this.isLoading = false
      }
    },

    // Akcja do tworzenia nowego punktu
    async addPoint(data: NewPointData) {
      try {
        const newPoint = await pointService.createPoint(data)

        // Zamiast .push(), tworzymy nową tablicę
        // To zmienia referencję i gwarantuje reaktywność
        this.points = [...this.points, newPoint]
      } catch (error) {
        console.error('Błąd podczas dodawania punktu:', error)
        throw error
      }
    },
    // Akcja do czyszczenia punktów (np. przy zmianie mapy)
    clearPoints() {
      this.points = []
    },
  },
})
