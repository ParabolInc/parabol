/**
 * Defines types for use with relay interfaces.
 *
 * @flow
 */

/**
 * The type of the `onCompleted` function passed to `commitMutation`
 */
export type CompletedHandler = (response: ?Object, errors: ?Array<Error>) => void

/**
 * The type of the `onError` function passed to `commitMutation`
 */
export type ErrorHandler = (error: Error) => void
