import {JwtPayload} from 'jsonwebtoken'
import {DataLoaderWorker} from '../graphql/graphql'

export type SCIMContext = {
  authToken: JwtPayload
  dataLoader: DataLoaderWorker
}
