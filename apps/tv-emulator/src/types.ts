export interface DiagnosticsEntry {
  id: string
  time: string
  message: string
}

export interface CatalogItem {
  uniqueID: string
  name: string
  brand: string
  price: number
  currency: string
  availability: 'in_stock' | 'out_of_stock' | 'preorder'
  leftPercent: number
  topPercent: number
  thumbnailUrl: string
  purchaseUrl: string
}

export interface QueryResult {
  uniqueID: string
  distance: number
  matched: boolean
  coordinates: { xPercent: number; yPercent: number }
  item: CatalogItem
}

export interface TelemetryDetail {
  programUID: string
  leftPercent: number
  topPercent: number
  leftPixels: number
  topPixels: number
  currentTime: number
  clientViewportWidth: number
  clientViewportHeight: number
  authToken?: string
}
