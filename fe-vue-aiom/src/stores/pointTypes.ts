import { defineStore } from 'pinia'
import { pointTypesService, type PointType } from '@/services/pointTypesService'
interface PointTypesState {
  pointTypes: PointType[]
  isLoading: boolean
}

export const usePointTypesStore = defineStore('pointTypes', {
  state: (): PointTypesState => ({
    pointTypes: [],
    isLoading: false,
  }),
  actions: {
    async fetchPointTypes() {
      if (this.pointTypes.length > 0) return // Nie pobieraj, jeśli już mamy dane

      this.isLoading = true
      try {
        this.pointTypes = await pointTypesService.getPointTypes()
      } catch (error) {
        console.error('Błąd podczas pobierania typów punktów:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
