import 'react'
declare module 'react' {
  interface TdHTMLAttributes<T> {
    height?: string | number
    width?: string | number
    bgcolor?: string
  }
  interface TableHTMLAttributes<T> {
    align?: 'center' | 'left' | 'right'
    bgcolor?: string
    height?: string | number
    width?: string | number
  }
}
