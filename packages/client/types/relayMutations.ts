import {RouterProps} from 'react-router'
import {PayloadError, RecordProxy, RecordSourceSelectorProxy, commitMutation} from 'relay-runtime'
import Atmosphere from '../Atmosphere'

export interface CompletedHandler {
  (response: any, errors?: (Error | PayloadError)[] | null): void
}

export interface ErrorHandler {
  (error: Error): void
}

export interface LocalHandlers {
  onError?: ErrorHandler
  onCompleted?: CompletedHandler
  history?: RouterProps['history']
}

interface UpdaterContext {
  atmosphere: Atmosphere
  store: RecordSourceSelectorProxy
  // viewerId?: string
}

export interface SharedUpdater<T> {
  (payload: RecordProxy<Omit<T, ' $refType'>>, context: UpdaterContext): void
}

export interface OnNextContext {
  atmosphere: Atmosphere
  history?: RouterProps['history']
}

export type OnNextHandler<TSubResponse> = (
  payload: Omit<TSubResponse, ' $refType'>,
  context: OnNextContext
) => void

export type UpdaterHandler<T = any> = (
  payload: RecordProxy<T>,
  context: {atmosphere: Atmosphere; store: RecordSourceSelectorProxy}
) => void

interface GeneratedMutationType {
  readonly response: any
  readonly variables: any
}

export type StandardMutation<T extends GeneratedMutationType> = (
  atmosphere: Atmosphere,
  variables: T['variables'],
  localHandlers?: LocalHandlers
) => ReturnType<typeof commitMutation>
