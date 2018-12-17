import {PayloadError, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

export interface CompletedHandler {
  (response: any, errors?: Array<Error | string | PayloadError> | null): void
}

export interface ErrorHandler {
  (error: Error): void
}

export interface LocalHandlers {
  onError?: ErrorHandler
  onCompleted?: CompletedHandler
}

interface UpdaterContext {
  store: RecordSourceSelectorProxy
  viewerId?: string
}

export interface TeamUpdater {
  (payload: RecordProxy, context: UpdaterContext): void
}
