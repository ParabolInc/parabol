import 'react'

declare module 'react' {
  export interface TdHTMLAttributes<T> {
    height?: string | number
    width?: string | number
    bgcolor?: string
  }
  export interface TableHTMLAttributes<T> {
    align?: 'center' | 'left' | 'right'
    bgcolor?: string
    height?: string | number
    width?: string | number
  }
}
