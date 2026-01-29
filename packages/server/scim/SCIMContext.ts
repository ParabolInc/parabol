import AuthToken from '../database/types/AuthToken'
import {DataLoaderWorker} from '../graphql/graphql'

export type SCIMContext = {
  authToken: AuthToken
  dataLoader: DataLoaderWorker
}
