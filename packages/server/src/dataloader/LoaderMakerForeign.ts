import * as primaryLoaderMakers from './primaryLoaderMakers'

export default class LoaderMakerForeign<T extends keyof typeof primaryLoaderMakers> {
  constructor(
    public pk: T,
    public field: string,
    public fetch: (ids: string[]) => Promise<any[]>
  ) {}
}
