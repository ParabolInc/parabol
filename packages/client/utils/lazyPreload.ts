/* Puts a preload method on every lazy component */
import {type ComponentType, type ExoticComponent, type LazyExoticComponent, lazy} from 'react'

type ImportThunk<T> = () => Promise<{default: T}>

export interface LazyExoticPreload<T extends ComponentType<any>> extends LazyExoticComponent<T> {
  preload: ImportThunk<T>
}

/**
 * A lazy-preloadable component for heterogeneous component maps.
 * Use instead of LazyExoticPreload<any> — avoids React 18's
 * CustomComponentPropsWithRef conditional type chain that tsgo
 * cannot resolve when the type parameter is `any`.
 */
export type LazyPreloadedComponent = ExoticComponent<any> & {
  preload: () => Promise<{default: ComponentType<any>}>
}

const lazyPreload = <T extends ComponentType<any>>(thunk: ImportThunk<T>) => {
  const lazyComponent = lazy(thunk) as LazyExoticPreload<T>
  lazyComponent.preload = thunk
  return lazyComponent
}

export default lazyPreload
