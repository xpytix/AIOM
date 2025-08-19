import apiClient from './apiClient';

// Definicja typów, aby TypeScript nam pomagał
export interface Map {
mapType: string;
initialView: any;
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  points: any[]; // Na razie uproszczone
  walks3D: any[]; // Na razie uproszczone
}

export const mapService = {
  // Pobiera wszystkie mapy
  getMaps(): Promise<Map[]> {
    return apiClient.get('/maps').then(res => res.data);
  },
  
  // Pobiera jedną mapę po ID
  getMapById(id: string): Promise<Map> {
    return apiClient.get(`/maps/${id}`).then(res => res.data);
  }
  // Tutaj w przyszłości dodasz createMap, updateMap, deleteMap...
};