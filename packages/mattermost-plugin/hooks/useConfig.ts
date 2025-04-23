let configPromise: Promise<any> | null = null
let config: any | null = null

export const useConfig = () => {
  // With React 18 this should be reduced to sth. like
  // const config = use(import(/* webpackChunkName: "env" */ '../env.js' as any))
  if (config) {
    return config
  }
  if (!configPromise) {
    configPromise = import(/* webpackChunkName: "env" */ '../env.js' as any).then(
      (env) => {
        config = env
      },
      (error) => {
        console.error('Error loading config', error)
      }
    )
  }
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw configPromise
}
