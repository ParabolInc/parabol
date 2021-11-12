import {DBType} from '../database/rethinkDriver'

/**
 * Used to register rethink types in the dataloader
 */
export default class RethinkPrimaryKeyLoaderMaker<T extends keyof DBType> {
  constructor(public table: T) {}
}
