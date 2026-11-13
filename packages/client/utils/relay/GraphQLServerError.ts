import type {PayloadError} from 'relay-runtime'

export type GraphQLErrorCode = NonNullable<NonNullable<PayloadError['extensions']>['code']>

export default class GraphQLServerError extends Error {
  readonly code: GraphQLErrorCode | undefined
  readonly errors: readonly PayloadError[]
  readonly traceId: string | undefined
  constructor(errors: readonly PayloadError[], traceId?: string) {
    super(errors[0]?.message ?? 'Unknown error')
    this.name = 'GraphQLServerError'
    this.code = errors[0]?.extensions?.code
    this.errors = errors
    this.traceId = traceId
  }
}
