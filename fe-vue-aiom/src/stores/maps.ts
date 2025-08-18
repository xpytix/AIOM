import { defineStore } from 'pinia';
import { mapService, type Map } from '@/services/mapService';

interface MapsState {
  maps: Map[];
  currentMap: Map | null;
  isLoading: boolean;
  error: string | null;
}

export const useMapsStore = defineStore('maps', {
  state: (): MapsState => ({
    maps: [],
    currentMap: null,
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchMaps() {
      this.isLoading = true;
      this.error = null;
      try {
        const maps = await mapService.getMaps();
        this.maps = maps;
        // Domyślnie ustawiamy pierwszą mapę z listy jako aktywną
        if (maps.length > 0) {
          this.currentMap = maps[0];
        }
      } catch (err) {
        this.error = 'Nie udało się pobrać map.';
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    setCurrentMap(map: Map) {
      this.currentMap = map;
    }
  }
});