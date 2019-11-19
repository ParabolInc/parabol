import {RouterProps} from 'react-router'
import {
  commitMutation,
  MutationParameters,
  PayloadError,
  RecordProxy,
  RecordSourceSelectorProxy
} from 'relay-runtime'
import Atmosphere from '../Atmosphere'

export interface CompletedHandler {
  (response: any, errors?: readonly (Error | PayloadError)[] | null): void
}

export interface ErrorHandler {
  (error: Error): void
}

/* DEPRECATED, use BaseLocalHandlers+ */
export interface LocalHandlers {
  onError?: ErrorHandler
  onCompleted?: CompletedHandler
  history?: RouterProps['history']
}

export interface BaseLocalHandlers {
  onError: ErrorHandler
  onCompleted: CompletedHandler
}

export interface HistoryLocalHandler extends BaseLocalHandlers {
  history: RouterProps['history']
}

export interface HistoryMaybeLocalHandler {
  history: RouterProps['history']
  onError?: ErrorHandler
  onCompleted?: CompletedHandler
}

export type OptionalHandlers = Partial<BaseLocalHandlers>

interface UpdaterContext<T = any> {
  atmosphere: Atmosphere
  store: RecordSourceSelectorProxy<T>
}

export interface SharedUpdater<T> {
  (payload: RecordProxy<Omit<T, ' $refType'>>, context: UpdaterContext<T>): void
}

export interface OnNextBaseContext {
  atmosphere: Atmosphere
}

export interface OnNextHistoryContext extends OnNextBaseContext {
  history: RouterProps['history']
}

export type OnNextHandler<TSubResponse, C = OnNextBaseContext> = (
  payload: Omit<TSubResponse, ' $refType'>,
  context: C
) => void

export type UpdaterHandler<T = any> = (
  payload: RecordProxy<T>,
  context: {atmosphere: Atmosphere; store: RecordSourceSelectorProxy}
) => void

export type SimpleMutation<T extends MutationParameters> = {
  (atmosphere: Atmosphere, variables: T['variables']): ReturnType<typeof commitMutation>
}
export type StandardMutation<T extends MutationParameters, C = BaseLocalHandlers> = {
  (atmosphere: Atmosphere, variables: T['variables'], localHandlers: C): ReturnType<
    typeof commitMutation
  >
}
