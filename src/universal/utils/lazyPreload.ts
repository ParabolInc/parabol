/* Puts a preload method on every lazy component */
import {ComponentType, lazy, LazyExoticComponent} from 'react'

type ImportThunk = () => Promise<{default: React.ComponentType<any>}>

interface LazyExoticPreload<T extends ComponentType<any>> extends LazyExoticComponent<T> {
  preload: ImportThunk
}

const lazyPreload = (thunk: ImportThunk) => {
  const lazyComponent = lazy(thunk)
  ;(lazyComponent as any).preload = thunk
  return lazyComponent as LazyExoticPreload<ComponentType<any>>
}

export default lazyPreload
