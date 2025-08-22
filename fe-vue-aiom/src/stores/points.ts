import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  pointService,
  type Point,
  type NewPointData,
  type UpdatePointData,
} from '@/services/pointService'

export const usePointsStore = defineStore('points', () => {
  // --- STATE ---
  const points = ref<Point[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // --- GETTERS ---
  const pointsOnMap = computed(() => points.value)

  // --- ACTIONS ---

  /**
   * Pobiera punkty dla określonej mapy.
   */
  async function fetchPointsForMap(mapId: string) {
    isLoading.value = true
    error.value = null
    try {
      points.value = await pointService.getPointsByMapId(mapId)
    } catch (err: any) {
      error.value = err.message || 'Nie udało się pobrać punktów.'
      points.value = [] // Wyczyść w razie błędu
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Dodaje nowy punkt.
   */
  async function addPoint(data: NewPointData) {
    isLoading.value = true
    error.value = null
    try {
      const newPoint = await pointService.createPoint(data)
      points.value.push(newPoint)
    } catch (err: any) {
      error.value = err.message || 'Nie udało się dodać punktu.'
      throw err // Rzuć błąd dalej, aby obsłużyć go w komponencie
    } finally {
      isLoading.value = false
    }
  }

  /**
   * NOWA AKCJA: Aktualizuje istniejący punkt.
   */
  async function updatePoint(id: string, data: UpdatePointData) {
    isLoading.value = true
    error.value = null
    try {
      const updatedPoint = await pointService.updatePoint(id, data)
      const index = points.value.findIndex((p) => p._id === id)
      if (index !== -1) {
        points.value[index] = updatedPoint
      }
    } catch (err: any) {
      error.value = err.message || 'Nie udało się zaktualizować punktu.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * NOWA AKCJA: Usuwa punkt.
   */
  async function deletePoint(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await pointService.deletePoint(id)
      points.value = points.value.filter((p) => p._id !== id)
    } catch (err: any) {
      error.value = err.message || 'Nie udało się usunąć punktu.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    points,
    isLoading,
    error,
    pointsOnMap,
    fetchPointsForMap,
    addPoint,
    updatePoint, // Udostępnij nową akcję
    deletePoint, // Udostępnij nową akcję
  }
})
