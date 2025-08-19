import { defineStore } from 'pinia'
import {
  pointTypesService,
  type NewPointTypeData,
  type PointType,
} from '@/services/pointTypesService'
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
      this.isLoading = true
      try {
        this.pointTypes = await pointTypesService.getPointTypes()
      } catch (error) {
        console.error('Błąd podczas pobierania typów punktów:', error)
      } finally {
        this.isLoading = false
      }
    },
    // NOWA AKCJA
    async addPointType(data: NewPointTypeData) {
      try {
        const newPointType = await pointTypesService.createPointType(data)
        this.pointTypes.push(newPointType)
      } catch (error) {
        console.error('Błąd podczas dodawania typu punktu:', error)
        throw error
      }
    },
  },
})
