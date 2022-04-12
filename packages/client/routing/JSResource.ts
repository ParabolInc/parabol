declare const UniqueId: string
type Loader<T> = () => Promise<T>

export type Result = any

/**
 * A cache of resources to avoid loading the same module twice. This is important
 * because Webpack dynamic imports only expose an asynchronous API for loading
 * modules, so to be able to access already-loaded modules synchronously we
 * must have stored the previous result somewhere.
 */
const resourceMap = new Map<typeof UniqueId, Resource<any>>()

/**
 * Type guardian to safely identify if a resource has a default property
 */
function hasDefaultProperty<T>(obj: T | {default: T}): obj is {default: T} {
  return !!(obj as {default: T}).default
}

/**
 * A generic resource: given some method to asynchronously load a value - the loader()
 * argument - it allows accessing the state of the resource.
 */
export class Resource<T> {
  private error: Error | null
  private loader: Loader<T>
  private promise: Promise<T> | null
  private result: T | null // can't distinguish if a value is loaded if T is nullable, so we have to add a 'state' field
  private state: 'uninitialized' | 'loaded' | 'error' | 'pending'

  constructor(loader: Loader<T>) {
    this.error = null
    this.loader = loader
    this.promise = null
    this.result = null
    this.state = 'uninitialized'
  }

  /**
   * Loads the resource if necessary.
   */
  load() {
    let promise = this.promise
    if (!promise) {
      promise = this.loader()
        .then((result: T | {default: T}) => {
          if (hasDefaultProperty(result)) {
            result = result.default
          }
          this.result = result
          this.state = 'loaded'
          return result
        })
        .catch((error) => {
          this.error = error
          this.state = 'error'
          throw error
        })
      this.promise = promise
      this.state = 'pending'
    }
    return promise
  }

  /**
   * Returns the result, if available. This can be useful to check if the value
   * is resolved yet.
   */
  get() {
    if (this.state === 'loaded') {
      return this.result
    }
    return null
  }

  /**
   * This is the key method for integrating with React Suspense. Read will:
   * - "Suspend" if the resource is still pending (currently implemented as
   *   throwing a Promise, though this is subject to change in future
   *   versions of React)
   * - Throw an error if the resource failed to load.
   * - Return the data of the resource if available.
   */
  read() {
    if (this.state === 'loaded') {
      return this.result
    } else if (this.state === 'error') {
      throw this.error
    } else {
      throw this.load()
    }
  }
}

/**
 * A helper method to create a resource, intended for dynamically loading code.
 *
 * Example:
 * ```
 *    // Before rendering, ie in an event handler:
 *    const resource = JSResource('Foo', () => import('./Foo.js));
 *    resource.load();
 *
 *    // in a React component:
 *    const Foo = resource.read();
 *    return <Foo ... />;
 * ```
 *
 * @param {*} moduleId A globally unique identifier for the resource used for caching
 * @param {*} loader A method to load the resource's data if necessary
 */
export default function JSResource<T>(moduleId: typeof UniqueId, loader: Loader<T>): Resource<T> {
  let resource = resourceMap.get(moduleId)
  if (!resource) {
    resource = new Resource(loader)
    resourceMap.set(moduleId, resource)
  }
  return resource
}
