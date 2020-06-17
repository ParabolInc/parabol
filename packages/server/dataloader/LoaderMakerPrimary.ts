import {DBType} from '../database/rethinkDriver'

export default class LoaderMakerPrimary<T extends keyof DBType> {
  constructor(public table: T) {}
}
