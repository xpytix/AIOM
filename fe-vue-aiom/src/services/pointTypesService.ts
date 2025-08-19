import apiClient from './apiClient'

export interface PointType {
  _id: string
  name: string
  description?: string
  icon?: string
  color?: string
}

// NOWY INTERFEJS
export interface NewPointTypeData {
  name: string
  description?: string
  icon?: string
  color?: string
}

export const pointTypesService = {
  getPointTypes(): Promise<PointType[]> {
    return apiClient.get('/point-types').then((res) => res.data)
  },

  // NOWA METODA
  createPointType(data: NewPointTypeData): Promise<PointType> {
    return apiClient.post('/point-types', data).then((res) => res.data)
  },
}
