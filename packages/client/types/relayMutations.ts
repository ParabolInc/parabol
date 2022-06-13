import {RouterProps} from 'react-router'
import {
  commitMutation,
  MutationParameters,
  RecordProxy,
  RecordSourceSelectorProxy
} from 'relay-runtime'
import Atmosphere from '../Atmosphere'

export interface CompletedHandler<TResponse = any> {
  (response: TResponse, errors?: readonly any[] | null): void
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

interface UpdaterContext {
  atmosphere: Atmosphere
  // can't assume store<Parent> == store<Child>, so no generics can be used here
  store: RecordSourceSelectorProxy
}

export interface SharedUpdater<T> {
  (payload: RecordProxy<Omit<T, ' $refType'>>, context: UpdaterContext): void
}

export interface OnNextBaseContext {
  atmosphere: Atmosphere
}

export interface OnNextHistoryContext extends OnNextBaseContext {
  history: RouterProps['history']
}

export type OnNextHandler<TSubResponse, C = OnNextBaseContext> = (
  payload: undefined extends TSubResponse
    ? Omit<NonNullable<TSubResponse>, ' $refType'> | undefined
    : Omit<TSubResponse, ' $refType'>,
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

export type RelayDateHack<T extends {variables: any}, P> = Omit<T, 'variables'> & {
  variables: Omit<T['variables'], keyof P> & P
}
