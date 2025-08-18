import apiClient from './apiClient'

export interface PointType {
  _id: string
  name: string
  icon?: string
}

export const pointTypesService = {
  getPointTypes(): Promise<PointType[]> {
    return apiClient.get('/point-types').then((res) => res.data)
  },
}
