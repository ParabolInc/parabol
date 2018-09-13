import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

export interface CompletedHandler {
  (response: any, errors?: Array<Error>): void
}

export interface ErrorHandler {
  (error: Error): void
}

interface UpdaterContext {
  store: RecordSourceSelectorProxy
  viewerId?: string
}

export interface TeamUpdater {
  (payload: RecordProxy, context: UpdaterContext): void
}
