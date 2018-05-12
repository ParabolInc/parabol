/**
 * Defines types for use with graphql interfaces.
 *
 * @flow
 */
import type {AuthToken} from 'universal/types/schema.flow'

export type Context = {
  authToken: AuthToken,
  dataLoader: Object,
  socketId: string
}
