/**
 * Defines types for use with graphql interfaces.
 *
 * @flow
 */
import type {AuthToken} from 'universal/types/auth';

import RethinkDataLoader from 'server/utils/RethinkDataLoader';

export type Context = {
  authToken: AuthToken,
  dataLoader: RethinkDataLoader,
  socketId: string
};
