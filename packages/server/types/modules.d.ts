// this is just to get typescript to stop complaining about imports
// declare module '*'
declare module '*.png'

declare module '*.svg'

declare const __PRODUCTION__: string

interface Window {
  ResizeObserver: any
  __ACTION__: any
}
