import {Tables} from './tables'
export default class LoaderMakerPrimary<T extends keyof Tables> {
  constructor(public table: T) {}
}
