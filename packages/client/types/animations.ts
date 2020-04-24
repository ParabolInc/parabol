export interface Point {
  top: number
  left: number
}

export interface Dims {
  height: number
  width: number
}

export interface Coords {
  x: number
  y: number
}

export interface BBox extends Point, Dims {}
