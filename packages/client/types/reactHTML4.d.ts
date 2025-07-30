import 'react'
declare module 'react' {
  interface TdHTMLAttributes<_T> {
    height?: string | number
    width?: string | number
    bgcolor?: string
  }
  interface TableHTMLAttributes<_T> {
    align?: 'center' | 'left' | 'right'
    bgcolor?: string
    height?: string | number
    width?: string | number
  }
}
