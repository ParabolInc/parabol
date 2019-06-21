import {RouterProps} from 'react-router'
import {PayloadError, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import Atmosphere from 'universal/Atmosphere'

export interface CompletedHandler {
  (response: any, errors?: Array<Error | PayloadError> | null): void
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
  store: RecordSourceSelectorProxy
  viewerId?: string
}

export interface TeamUpdater {
  (payload: RecordProxy, context: UpdaterContext): void
}

export interface OnNextContext {
  atmosphere: Atmosphere
  history: RouterProps['history']
}

export type OnNextHandler<TSubResponse> = (payload: TSubResponse, context: OnNextContext) => void

export type UpdaterHandler<T = any> = (
  payload: RecordProxy<T>,
  context: {atmosphere: Atmosphere; store: RecordSourceSelectorProxy}
) => void
