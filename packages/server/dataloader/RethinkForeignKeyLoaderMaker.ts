import * as rethinkPrimaryKeyLoaderMakers from './rethinkPrimaryKeyLoaderMakers'

/**
 * Load rethink entities by foreign key
 */
export default class RethinkForeignKeyLodaerMaker<
  T extends keyof typeof rethinkPrimaryKeyLoaderMakers
> {
  constructor(
    public pk: T,
    public field: string,
    public fetch: (ids: readonly string[]) => Promise<any[]>
  ) {}
}
