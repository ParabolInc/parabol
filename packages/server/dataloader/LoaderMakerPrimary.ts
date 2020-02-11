import {RethinkTypes} from '../database/rethinkDriver'

export default class LoaderMakerPrimary<T extends keyof RethinkTypes> {
  constructor(public table: RethinkTypes[T]['type']) {}
}
