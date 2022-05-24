/*eslint-disable*/
import {EventEmitter} from 'events'
import {TcpNetConnectOpts} from 'net'
import {ConnectionOptions} from 'tls'

type DeepPartial<T> = RValue<T> | {
    [P in keyof T]?: T[P] extends Array<infer U1> ? Array<DeepPartial<U1>> : T[P] extends ReadonlyArray<infer U2> ? ReadonlyArray<DeepPartial<U2>> : DeepPartial<T[P]>;
};

// User defined schemas
export interface TableSchema {
  type: any
  index: string
}

export interface UserSchema {
  [tableName: string]: TableSchema
}

//#region optargs
export type Primitives = null | string | boolean | number
export type Format = 'native' | 'raw'
export type Durability = 'hard' | 'soft'
export type RValue<T = any> = RDatum<T> | T
// TODO: Add recursive type when option available
// type RValue<T = any> = T extends RDatum
// ? T
// : T extends null | string | number | boolean
// ? RDatum<T>
// : T extends Array<infer T1>
// ? RArray<T1> : T extends Function ? never : T extends object ? { [P in keyof T]: RValue<any> } : never;
// type RObject<T> =  {
//     [x: keyof T]: RValue<T[keyof T]>;
// } | RDatum<T>;
export type Func<T, Res = any> = (doc: RDatum<T>) => RValue<Res>
export type MultiFieldSelector = object | any[] | string
export type FieldSelector<T, U = any> = string | Func<T, U>

export interface ServerInfo {
  id: string
  name: string
  proxy: boolean
}

export type RServerConnectionOptions =
  | (Partial<ConnectionOptions> & {tls: boolean})
  | (Partial<TcpNetConnectOpts> & {tls?: false})

export interface RBaseConnectionOptions {
  db?: string // default 'test'
  user?: string // default 'admin'
  password?: string // default ''
  discovery?: boolean // default false
  pool?: boolean // default true
  buffer?: number // default = number of servers
  max?: number // default = number of servers
  timeout?: number // default = 20
  pingInterval?: number // default -1
  timeoutError?: number // default = 1000
  timeoutGb?: number // default = 60*60*1000
  maxExponent?: number // default 6
  silent?: boolean // default = false
  log?: (message: string) => any; // default undefined;
  [other: string]: any
}

export type RConnectionOptions = RBaseConnectionOptions &
  ({server: RServerConnectionOptions} | {host?: string; port?: number})

export type RPoolConnectionOptions = RConnectionOptions & {
  servers?: RServerConnectionOptions[]
  waitForHealthy?: boolean // default true
}
export interface TableCreateOptions {
  primaryKey?: string // default: "id"
  shards?: number // 1-32
  replicas?: number | {[serverTag: string]: number}
  primaryReplicaTag?: string
  nonvotingReplicaTags?: string[]
  durability?: Durability // "soft" or "hard" defualt: "hard"
}

export interface TableReconfigureOptions {
  shards?: number // 1-32
  replicas?: number | {[serverTag: string]: number}
  primaryReplicaTag?: string
  dryRun?: boolean
  emergencyRepair?: 'unsafe_rollback' | 'unsafe_rollback_or_erase'
}

export interface TableOptions {
  readMode?: 'single' | 'majority' | 'outdated' | 'primary'
  identifierFormat?: 'name' | 'uuid' // "name" "uuid";
}

export interface DeleteOptions {
  ignoreWriteHook?: boolean
  returnChanges?: boolean | string | 'always' // true, false or "always" default: false
  durability?: Durability // "soft" or "hard" defualt: table
}

export interface InsertOptions extends DeleteOptions {
  conflict?:
  | 'error'
  | 'replace'
  | 'update'
  | ((id: RDatum, oldDoc: RDatum, newDoc: RDatum) => RDatum | object)
}

export interface UpdateOptions extends DeleteOptions {
  nonAtomic?: boolean
}

export interface IndexOptions {
  multi?: boolean
  geo?: boolean
}

export interface RunOptions {
  timeFormat?: Format | 'ISO8601' // 'native' or 'raw', default 'native'
  groupFormat?: Format // 'native' or 'raw', default 'native'
  binaryFormat?: Format // 'native' or 'raw', default 'native'
  useOutdated?: boolean // default false
  profile?: boolean // default false
  durability?: Durability // 'hard' or 'soft'
  noreply?: boolean // default false
  db?: string
  arrayLimit?: number // default 100,000
  minBatchRows?: number // default 8
  maxBatchRows?: number
  maxBatchRow?: number // default unlimited
  maxBatchBytes?: number // default 1MB
  maxBatchSeconds?: number // default 0.5
  firstBatchScaledownFactor?: number // default 4
  readMode?: 'single' | 'majority' | 'outdated'
}

export interface HttpRequestOptions {
  // General
  timeout?: number // default 30
  reattempts?: number // default 5
  redirects?: number // default 1
  verify?: boolean // default true
  resultFormat?: 'text' | 'json' | 'jsonp' | 'binary' | 'auto'

  // Request Options
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' // "GET" "POST" "PUT" "PATCH" "DELETE" "HEAD"
  params?: object
  header?: {[key: string]: string | object}
  data?: object
}

export interface HTTPStreamRequestOptions extends HttpRequestOptions {
  // Pagination
  page?:
  | 'link-next'
  | ((
    param: RDatum<{params: any; header: any; body: any}>
  ) => RValue<string>)
  pageLimit?: number // -1 = no limit.
}

export interface WaitOptions {
  waitFor?:
  | 'ready_for_outdated_reads'
  | 'ready_for_reads'
  | 'ready_for_writes'
  | 'all_replicas_ready'
  timeout?: number
}

export interface ChangesOptions {
  squash?: boolean | number
  changefeedQueueSize?: number
  includeInitial?: boolean
  includeStates?: boolean
  includeTypes?: boolean
  includeOffsets?: boolean
}
//#endregion optargs

//#region results
export interface ValueChange<T = any> {
  error?: string
  old_val?: T
  new_val?: T
}
export interface DBConfig {
  id: string
  name: string
}
export interface DBChangeResult {
  config_changes: Array<ValueChange<DBConfig>>
  tables_dropped: number
  dbs_created: number
  dbs_dropped: number
}
export interface IndexChangeResult {
  created?: number
  renamed?: number
  dropped?: number
}
export interface RebalanceResult {
  reconfigured: number
  config_changes: Array<ValueChange<TableConfig>>
  status_changes: Array<ValueChange<TableStatus>>
}
export interface ReconfigureResult {
  rebalanced: number
  status_changes: Array<ValueChange<TableConfig>>
}
export interface TableChangeResult {
  tables_created?: number
  tables_dropped?: number
  config_changes: Array<ValueChange<TableConfig>>
}

export interface TableShard {
  primary_replica: string
  replicas: string[]
  nonvoting_replicas: string[]
}

export interface TableConfig {
  id: string
  name: string
  db: string
  primary_key: string // default: "id"
  shards: TableShard[]
  indexes: string[]
  write_acks: string
  durability: Durability // "soft" or "hard" defualt: "hard"
}
export interface TableStatus {
  id: string
  name: string
  db: string
  status: {
    all_replicas_ready: boolean
    ready_for_outdated_reads: boolean
    ready_for_reads: boolean
    ready_for_writes: boolean
  }
  shards: TableShard[]
}
export interface IndexStatus {
  function: Buffer
  geo: boolean
  index: string
  multi: boolean
  outdated: boolean
  ready: boolean
}
export interface WriteResult<T = any> {
  deleted: number
  skipped: number
  errors: number
  first_error?: string
  inserted: number
  replaced: number
  unchanged: number
  generated_keys?: string[]
  warnings?: string[]
  changes?: Array<ValueChange<T>>
}
export interface Changes<T = any> extends ValueChange<T> {
  state?: 'initializing' | 'ready' // 'initializing', 'ready'. cant come together with values
  type?: 'change' | 'add' | 'remove' | 'initial' | 'uninitial' | 'state'
  old_offset?: number
  new_offset?: number
}

export interface JoinResult<T1 = any, T2 = any> {
  left: T1
  right: T2
}

export interface GroupResults<TGroupBy = any, TReduction = any> {
  group: TGroupBy
  reduction: TReduction
}

export interface MatchResults {
  start: number
  end: number
  str: string
  groups: Array<{
    start: number
    end: number
    str: string
  }>
}

//#endregion results

//#region operations
export interface Connection extends EventEmitter {
  readonly open: boolean
  clientPort: number
  clientAddress: string
  close(options?: {noreplyWait: boolean}): Promise<void>
  reconnect(options?: {noreplyWait: boolean}): Promise<Connection>
  use(db: string): void
  noreplyWait(): Promise<void>
  server(): Promise<ServerInfo>
}

export interface MasterPool extends EventEmitter {
  readonly isHealthy: boolean
  waitForHealthy(): Promise<this>
  drain(options?: {noreplyWait: boolean}): Promise<void>
  getLength(): number
  getAvailableLength(): number
  getPools(): ConnectionPool[]
  setOptions(options: {
    discovery?: boolean
    buffer?: number
    max?: number
    timeoutError?: number
    timeoutGb?: number
    maxExponent?: number
    silent?: boolean
    log?: (msg: string) => void
  }): void
}
export interface ConnectionPool extends EventEmitter {
  readonly isHealthy: boolean

  drain(options?: {noreplyWait: boolean}): Promise<void>
  getLength(): number
  getAvailableLength(): number
  getConnections(): Connection[]
}

export interface RServer {
  host: string
  port: number
}

export type RCursorType =
  | 'Atom'
  | 'Cursor'
  | 'Feed'
  | 'AtomFeed'
  | 'OrderByLimitFeed'
  | 'UnionedFeed'
export interface RCursor<T = any> extends NodeJS.ReadableStream {
  readonly profile: any
  getType(): RCursorType
  next(): Promise<T>
  toArray(): Promise<T[]>
  close(): Promise<void>
  each(
    callback: (err: RethinkDBError | undefined, row: any) => any,
    onFinishedCallback?: () => any
  ): Promise<any>
  eachAsync(
    rowHandler: (row: any, rowFinished?: (error?: any) => any) => any,
    final?: (error: any) => any
  ): Promise<void>
}

export interface RethinkDBError extends Error {
  readonly type: RethinkDBErrorType
}

export enum RethinkDBErrorType {
  UNKNOWN,
  // driver
  API_FAIL,
  // query errors
  CONNECTION,
  MASTER_POOL_FAIL,
  POOL_FAIL,
  CURSOR_END,
  TIMEOUT,
  CANCEL,
  PARSE,
  ARITY,
  CURSOR,
  // connection error
  AUTH,
  UNSUPPORTED_PROTOCOL,
  // reql response errors
  INTERNAL,
  RESOURCE_LIMIT,
  QUERY_LOGIC,
  NON_EXISTENCE,
  OP_FAILED,
  OP_INDETERMINATE,
  USER,
  PERMISSION_ERROR
}

export interface RQuery<T = any> {
  typeOf(): RDatum<string>
  info(): RDatum<{
    value?: string
    db?: {id: string; name: string; type: string}
    doc_count_estimates?: number[]
    id?: string
    indexes?: string[]
    name?: string
    primary_key?: string
    type: string
  }>

  run(options: RunOptions & {noreply: true}): Promise<undefined>
  run(
    connection: Connection,
    options: RunOptions & {noreply: true}
  ): Promise<undefined>
  run(
    options: RunOptions & {profile: true}
  ): Promise<{profile: any; result: T}>
  run(
    connection: Connection,
    options: RunOptions & {profile: true}
  ): Promise<{profile: any; result: T}>
  run(connection?: Connection | RunOptions, options?: RunOptions): Promise<T>
  getCursor(
    connection?: Connection | RunOptions,
    options?: RunOptions
  ): T extends Array<infer T1>
    ? Promise<RCursor<T1>>
    : T extends RCursor<unknown>
    ? Promise<T>
    : Promise<RCursor<T>>
  then(): never
}
export interface RDatum<T = any> extends RQuery<T> {
  do<U>(
    ...args: Array<RDatum | ((arg: RDatum<T>, ...args: RDatum[]) => U)>
  ): U extends RStream ? RStream : RDatum
  <U extends string | number>(attribute: RValue<U>): U extends keyof T
    ? RDatum<T[U]>
    : RDatum<any>
  getField<U extends string | number>(
    attribute: RValue<U>
  ): U extends keyof T ? RDatum<T[U]> : RDatum<any>
  nth(
    attribute: RValue<number>
  ): T extends Array<infer T1> ? RDatum<T1> : never
  default<U>(value: U): RDatum<T | U>
  hasFields(
    ...fields: string[]
  ): T extends Array<unknown> ? RDatum<T> : RDatum<boolean>
  // Works only if T is an array
  append<U>(value: RValue<U>): T extends U[] ? RDatum<T> : never
  prepend<U>(value: RValue<U>): T extends U[] ? RDatum<T> : never
  difference<U>(value: RValue<U[]>): T extends U[] ? RDatum<T> : never
  setInsert<U>(value: RValue<U>): T extends U[] ? RDatum<T> : never
  setUnion<U>(value: RValue<U[]>): T extends U[] ? RDatum<T> : never
  setIntersection<U>(value: RValue<U[]>): T extends U[] ? RDatum<T> : never
  setDifference<U>(value: RValue<U[]>): T extends U[] ? RDatum<T> : never
  insertAt<U>(
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never
  changeAt<U>(
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never
  spliceAt<U>(
    index: RValue<number>,
    value: RValue<U[]>
  ): T extends U[] ? RDatum<T> : never
  deleteAt<U>(
    offset: RValue<number>,
    endOffset?: RValue<number>
  ): T extends U[] ? RDatum<T> : never
  union<U = T extends Array<infer T1> ? T1 : never>(
    ...other: Array<RStream<U> | RValue<U[]> | {interleave: boolean | string}>
  ): T extends any[] ? RDatum<U[]> : never
  map<Res = any, U = T extends Array<infer T1> ? T1 : never>(
    ...args: Array<RStream | ((arg: RDatum<U>, ...args: RDatum[]) => any)>
  ): T extends any[] ? RDatum<Res[]> : never
  concatMap<Res = any, U = T extends ArrayLike<infer T1> ? T1 : never>(
    ...args: Array<RStream | ((arg: RDatum<U>, ...args: RDatum[]) => Res)>
  ): T extends ArrayLike<any> ? RDatum<Res[]> : never
  forEach<
    U = any,
    ONE = T extends Array<infer T1> ? T1 : never,
    RES extends
    | RDatum<WriteResult<U>>
    | RDatum<DBChangeResult>
    | RDatum<IndexChangeResult> = RDatum<WriteResult<U>>
  >(
    func: (res: RDatum<ONE>) => RES
  ): T extends any[] ? RES : never

  withFields(
    ...fields: MultiFieldSelector[]
  ): T extends Array<infer T1> ? RDatum<Array<Partial<T1>>> : never
  filter<U = T extends Array<infer T1> ? T1 : never>(
    predicate: DeepPartial<U> | ((doc: RDatum<U>) => RValue<boolean>),
    options?: {default: boolean}
  ): this
  includes(geometry: RDatum): T extends Array<unknown> ? RDatum<T> : never
  intersects(geometry: RDatum): T extends Array<unknown> ? RDatum<T> : never

  // LOGIC
  contains<U = T extends Array<infer T1> ? T1 : never>(
    val1: any[] | null | string | number | object | Func<U>,
    ...value: Array<any[] | null | string | number | object | Func<U>>
  ): T extends Array<unknown> ? RDatum<boolean> : never // also predicate

  // ORDER BY
  orderBy(
    ...fields: Array<FieldSelector<T>>
  ): T extends Array<unknown> ? RDatum<T> : never

  // GROUP
  group(
    ...fieldOrFunc: Array<FieldSelector<T>>
  ): T extends Array<unknown> ? RDatum : never // <GroupResults<T[U], T[]>>;

  ungroup(): RDatum<Array<GroupResults<any, any>>>

  // SELECT FUNCTIONS
  count<U = T extends Array<infer T1> ? T1 : never>(
    value?: RValue<U> | Func<U, boolean>
  ): T extends Array<unknown> ? RDatum<number> : never
  sum<U = T extends Array<infer T1> ? T1 : never>(
    value?: FieldSelector<U, number | null>
  ): T extends Array<unknown> ? RDatum<number> : never
  avg<U = T extends Array<infer T1> ? T1 : never>(
    value?: FieldSelector<U, number | null>
  ): T extends Array<unknown> ? RDatum<number> : never
  min<U = T extends Array<infer T1> ? T1 : never>(
    value?: FieldSelector<U, number | null>
  ): T extends Array<unknown> ? RDatum<number> : never
  max<U = T extends Array<infer T1> ? T1 : never>(
    value?: FieldSelector<U, number | null>
  ): T extends Array<unknown> ? RDatum<number> : never
  reduce<U = any, ONE = T extends Array<infer T1> ? T1 : never>(
    reduceFunction: (left: RDatum<ONE>, right: RDatum<ONE>) => any
  ): T extends Array<unknown> ? RDatum<U> : never
  fold<ACC = any, RES = any, ONE = T extends Array<infer T1> ? T1 : never>(
    base: any,
    foldFunction: (acc: RDatum<ACC>, next: RDatum<ONE>) => any, // this any is ACC
    options?: {
      emit?: (
        acc: RDatum<ACC>,
        next: RDatum<ONE>,
        // tslint:disable-next-line:variable-name
        new_acc: RDatum<ACC>
      ) => any[] // this any is RES
      finalEmit?: (acc: RStream) => any[] // this any is also RES
    }
  ): T extends Array<unknown> ? RDatum<RES[]> : never
  // SELECT
  distinct(): RDatum<T>

  pluck(
    ...fields: MultiFieldSelector[]
  ): T extends Array<infer T1>
    ? RDatum<Array<Partial<T1>>>
    : RDatum<Partial<T>>

  without(
    ...fields: MultiFieldSelector[]
  ): T extends Array<infer T1>
    ? RDatum<Array<Partial<T1>>>
    : RDatum<Partial<T>>

  merge<U = any>(
    ...objects: Array<object | RDatum | ((arg: RDatum<T>) => any)>
  ): RDatum<U>

  innerJoin<U, T2 = T extends Array<infer T1> ? T1 : never>(
    other: RStream<U> | RValue<U[]>,
    predicate: (doc1: RDatum<T2>, doc2: RDatum<U>) => RValue<boolean>
  ): RDatum<Array<JoinResult<T2, U>>>
  outerJoin<U, T2 = T extends Array<infer T1> ? T1 : never>(
    other: RStream<U> | RValue<U[]>,
    predicate: (doc1: RDatum<T2>, doc2: RDatum<U>) => RValue<boolean>
  ): RDatum<Array<JoinResult<T2, U>>> // actually left join
  eqJoin<U, T2 = T extends Array<infer T1> ? T1 : never>(
    fieldOrPredicate: RValue<keyof T2> | Func<T2, boolean>,
    rightTable: RTable<any, U>,
    options?: {index: string}
  ): RStream<JoinResult<T2, U>>
  skip(n: RValue<number>): T extends Array<unknown> ? RDatum<T> : never
  limit(n: RValue<number>): T extends Array<unknown> ? RDatum<T> : never
  slice(
    start: RValue<number>,
    end?: RValue<number>,
    options?: {leftBound?: 'open' | 'closed'; rightBound?: 'open' | 'closed'}
  ): T extends Array<unknown> ? RDatum<T> : never
  slice(
    start: RValue<number>,
    options?: {leftBound?: 'open' | 'closed'; rightBound?: 'open' | 'closed'}
  ): T extends Array<unknown> ? RDatum<T> : never
  sample(n: RValue<number>): T extends Array<unknown> ? RDatum<T> : never
  offsetsOf<U = T extends Array<infer T1> ? T1 : never>(
    single: RValue<U> | Func<U, boolean>
  ): T extends Array<unknown> ? RDatum<number[]> : never

  isEmpty(): T extends Array<unknown> ? RDatum<boolean> : never

  coerceTo<U = any>(
    type: 'object' | 'OBJECT'
  ): T extends Array<unknown> ? RDatum<U> : never
  coerceTo(type: 'string' | 'STRING'): RDatum<string>
  coerceTo(type: 'array' | 'ARRAY'): T extends ArrayLike<RSelection<infer U>> ? RDatum<U[]> : RDatum<any[]>
  // Works only if T is a string
  coerceTo(
    type: 'number' | 'NUMBER'
  ): T extends string ? RDatum<number> : never
  coerceTo(
    type: 'binary' | 'BINARY'
  ): T extends string ? RDatum<Buffer> : never
  match(
    regexp: RValue<string>
  ): T extends string ? RDatum<MatchResults | null> : never
  split(
    seperator?: RValue<string>,
    maxSplits?: RValue<number>
  ): T extends string ? RDatum<string[]> : never
  upcase(): T extends string ? RDatum<string> : never
  downcase(): T extends string ? RDatum<string> : never
  add(
    ...str: Array<RValue<string> | RValue<number>>
  ): T extends string | number | Date ? RDatum<T> : never
  gt(
    ...value: Array<RValue<string> | RValue<number> | RValue<Date>>
  ): T extends string | number | Date ? RDatum<boolean> : never
  ge(
    ...value: Array<RValue<string> | RValue<number> | RValue<Date>>
  ): T extends string | number | Date ? RDatum<boolean> : never
  lt(
    ...value: Array<RValue<string> | RValue<number> | RValue<Date>>
  ): T extends string | number | Date ? RDatum<boolean> : never
  le(
    ...value: Array<RValue<string> | RValue<number> | RValue<Date>>
  ): T extends string | number | Date ? RDatum<boolean> : never
  // Works only for numbers
  sub(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : T extends Date ? RDatum<Date> : never
  sub(date: RValue<Date>): T extends Date ? RDatum<number> : never
  mul(...num: Array<RValue<number>>): T extends number ? RDatum<number> : never
  div(...num: Array<RValue<number>>): T extends number ? RDatum<number> : never
  mod(...num: Array<RValue<number>>): T extends number ? RDatum<number> : never

  bitAnd(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : never
  bitOr(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : never
  bitXor(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : never
  bitNot(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : never
  bitSal(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : never
  bitShl(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : never
  bitSar(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : never
  bitSht(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : never

  round(): T extends number ? RDatum<number> : never
  ceil(): T extends number ? RDatum<number> : never
  floor(): T extends number ? RDatum<number> : never
  // Works only for bool
  branch(
    trueBranch: any,
    falseBranchOrTest: any,
    ...branches: any[]
  ): T extends boolean ? RDatum<any> : never
  and(
    ...bool: Array<RValue<boolean>>
  ): T extends boolean ? RDatum<boolean> : never
  or(
    ...bool: Array<RValue<boolean>>
  ): T extends boolean ? RDatum<boolean> : never
  not(): T extends boolean ? RDatum<boolean> : never
  // Works only for Date
  inTimezone(timezone: string): T extends Date ? RDatum<Date> : never
  timezone(): T extends Date ? RDatum<string> : never
  during(
    start: RValue<Date>,
    end: RValue<Date>,
    options?: {leftBound: 'open' | 'closed'; rightBound: 'open' | 'closed'}
  ): T extends Date ? RDatum<boolean> : never
  date(): T extends Date ? RDatum<Date> : never
  timeOfDay(): T extends Date ? RDatum<number> : never
  year(): T extends Date ? RDatum<number> : never
  month(): T extends Date ? RDatum<number> : never
  day(): T extends Date ? RDatum<number> : never
  dayOfWeek(): T extends Date ? RDatum<number> : never
  dayOfYear(): T extends Date ? RDatum<number> : never
  hours(): T extends Date ? RDatum<number> : never
  minutes(): T extends Date ? RDatum<number> : never
  seconds(): T extends Date ? RDatum<number> : never
  toISO8601(): T extends Date ? RDatum<string> : never
  toEpochTime(): T extends Date ? RDatum<number> : never
  // Works only for geo
  distance(
    geo: RValue,
    options?: {geoSystem?: string; unit?: string}
  ): RDatum<number>
  toGeojson(): RDatum
  // Works only for line
  fill(): RDatum
  polygonSub(polygon2: RValue): RDatum

  toJsonString(): RDatum<string>
  toJSON(): RDatum<string>

  eq(...value: RValue[]): RDatum<boolean>
  ne(...value: RValue[]): RDatum<boolean>

  keys(): RDatum<string[]>
  values(): RDatum<Array<T[keyof T]>>
}

export interface RStream<T = any> extends RQuery<T[]> {
  forEach<
    U = any,
    RES extends
    | RDatum<WriteResult<U>>
    | RDatum<DBChangeResult>
    | RDatum<IndexChangeResult> = RDatum<WriteResult<U>>
  >(
    func: (res: RDatum<T>) => RES
  ): RES
  changes(options?: ChangesOptions): RFeed<Changes<T>>

  <U extends keyof T>(attribute: RValue<U>): RStream<T[U]>
  (n: RValue<number>): RDatum<T>
  getField<U extends keyof T>(fieldName: RValue<U>): RStream<T[U]>

  // FROM

  innerJoin<U = any>(
    other: RStream<U> | RValue<U[]>,
    predicate: (doc1: RDatum<T>, doc2: RDatum<U>) => RValue<boolean>
  ): RStream<JoinResult<T, U>>
  outerJoin<U = any>(
    other: RStream<U> | RValue<U[]>,
    predicate: (doc1: RDatum<T>, doc2: RDatum<U>) => RValue<boolean>
  ): RStream<JoinResult<T, U>> // actually left join
  eqJoin<U = any>(
    fieldOrPredicate: RValue<keyof T> | Func<T, boolean>,
    rightTable: RTable<any, U>,
    options?: {index: string}
  ): RStream<JoinResult<T, U>>

  zip(): T extends JoinResult<infer U1, infer U2> ? U1 & U2 : never

  union<U = T>(
    ...other: Array<RStream<U> | RValue<U[]> | {interleave: boolean | string}>
  ): RStream<U>
  union<U = T>(
    ...other: Array<
      RStream<U> | RValue<U[]> | RFeed<U> | {interleave: boolean | string}
    >
  ): RFeed<U>
  map<U = any>(
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RStream<U>
  concatMap<U = any>(
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RStream<U>

  // WHERE
  withFields(...fields: MultiFieldSelector[]): RStream<Partial<T>>
  hasFields(...fields: MultiFieldSelector[]): RStream<T>
  filter(
    predicate: DeepPartial<T> | ((doc: RDatum<T>) => RValue<boolean>),
    options?: {default: boolean}
  ): this
  includes(geometry: RDatum): RStream<T>
  intersects(geometry: RDatum): RStream<T>

  // LOGIC
  contains(
    val1: any[] | null | string | number | object | Func<T>,
    ...value: Array<any[] | null | string | number | object | Func<T>>
  ): RDatum<boolean>

  // ORDER BY
  orderBy(...fieldOrIndex: Array<FieldSelector<T> | {index: string}>): this // also r.desc(string)

  // GROUP
  group<U extends keyof T>(
    ...fieldOrFunc: Array<
      U | ((row: RDatum<T>) => any) | {index?: string; multi?: boolean}
    >
  ): T extends Array<unknown> ? RDatum : never // <GroupResults<T[U], T[]>>;

  // SELECT FUNCTIONS
  count(value?: RValue<T> | Func<T, boolean>): RDatum<number>
  sum(value?: RValue<T> | Func<T, number | null>): RDatum<number>
  avg(value?: RValue<T> | Func<T, number | null>): RDatum<number>
  min(
    value?: RValue<T> | Func<T, number | null> | {index: string}
  ): RDatum<number>
  max(
    value?: RValue<T> | Func<T, number | null> | {index: string}
  ): RDatum<number>
  reduce<U = any>(
    reduceFunction: (left: RDatum<T>, right: RDatum<T>) => any
  ): RDatum<U>
  fold<ACC = any, RES = any>(
    base: any,
    foldFunction: (acc: RDatum<ACC>, next: RDatum<T>) => any, // this any is ACC
    options?: {
      // tslint:disable-next-line:variable-name
      emit?: (acc: RDatum<ACC>, next: RDatum<T>, new_acc: RDatum<ACC>) => any[] // this any is RES
      finalEmit?: (acc: RStream) => any[] // this any is also RES
    }
  ): RStream<RES>
  // SELECT
  distinct(): RStream<T>
  distinct<TIndex = any>(index: {index: string}): RStream<TIndex>

  pluck(...fields: MultiFieldSelector[]): RStream<Partial<T>>
  without(...fields: MultiFieldSelector[]): RStream<Partial<T>>

  merge<U = any>(
    ...objects: Array<object | RDatum | ((arg: RDatum<T>) => any)>
  ): RStream<U>

  skip(n: RValue<number>): this
  limit(n: RValue<number>): this
  slice(
    start: RValue<number>,
    end?: RValue<number>,
    options?: {leftBound?: 'open' | 'closed'; rightBound?: 'open' | 'closed'}
  ): this
  slice(
    start: RValue<number>,
    options?: {leftBound?: 'open' | 'closed'; rightBound?: 'open' | 'closed'}
  ): this
  nth(n: RValue<number>): RDatum<T>
  sample(n: RValue<number>): this
  offsetsOf(single: RValue<T> | Func<T, boolean>): RDatum<number[]>

  isEmpty(): RDatum<boolean>

  coerceTo(type: 'array'): RDatum<T[]>
  coerceTo<U = any>(type: 'object'): RDatum<U>
}

export interface RFeed<T = any> extends RQuery<RCursor<T>> {
  <U extends keyof T>(attribute: RValue<U>): RFeed<T[U]>
  getField<U extends keyof T>(fieldName: RValue<U>): RFeed<T[U]>

  union<U = T>(
    ...other: Array<
      RStream<U> | RValue<U[]> | RFeed<U> | {interleave: boolean | string}
    >
  ): RFeed<U>
  map<U = any>(
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RFeed<U>
  concatMap<U = any>(
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RFeed<U>

  // WHERE

  withFields(...fields: MultiFieldSelector[]): RFeed<Partial<T>>
  hasFields(...fields: MultiFieldSelector[]): RFeed<T>
  filter(
    predicate: DeepPartial<T> | ((doc: RDatum<T>) => RValue<boolean>),
    options?: {default: boolean}
  ): this
  includes(geometry: RDatum): RFeed<T>
  intersects(geometry: RDatum): RFeed<T>

  fold<ACC = any, RES = any>(
    base: any,
    foldFunction: (acc: RDatum<ACC>, next: RDatum<T>) => any, // this any is ACC
    options: {
      emit: (acc: RDatum<ACC>, next: RDatum<T>, newAcc: RDatum<ACC>) => any[] // this any is RES
    }
  ): RFeed<RES>

  pluck(...fields: MultiFieldSelector[]): RFeed<Partial<T>>
  without(...fields: MultiFieldSelector[]): RFeed<Partial<T>>
}

export interface RSingleSelection<T = any> extends RDatum<T> {
  update(
    obj: RValue<DeepPartial<T>> | ((arg: RDatum<T>) => any),
    options?: UpdateOptions
  ): RDatum<WriteResult<T>>
  replace(
    obj: RValue<T> | ((arg: RDatum<T>) => any),
    options?: UpdateOptions
  ): RDatum<WriteResult<T>>
  delete(options?: DeleteOptions): RDatum<WriteResult<T>>
  changes(options?: ChangesOptions): RFeed<Changes<T>>
}

export interface RSelection<T = any> extends RStream<T> {
  update(
    obj: RValue<DeepPartial<T>> | ((arg: RDatum<T>) => any),
    options?: UpdateOptions
  ): RDatum<WriteResult<T>>
  replace(
    obj: RValue<T> | ((arg: RDatum<T>) => any),
    options?: UpdateOptions
  ): RDatum<WriteResult<T>>
  delete(options?: DeleteOptions): RDatum<WriteResult<T>>
  nth(n: RValue<number>): RSingleSelection<T>
}
export interface RTable<TSchema extends TableSchema, T = TSchema['type']> extends RSelection<T> {
  grant(
    userName: string,
    options?: {
      read?: boolean
      write?: boolean
      connect?: boolean
      config?: boolean
    }
  ): RDatum<{
    granted: number
    permissions_changes: Array<
      ValueChange<{
        read: boolean
        write: boolean
        connect: boolean
        config: boolean
      }>
    >
  }>
  indexCreate(
    indexName: RValue<string>,
    indexFunction?: RDatum | Buffer | RDatum[] | ((row: RDatum) => any),
    options?: IndexOptions
  ): RDatum<IndexChangeResult>
  indexCreate(
    indexName: RValue<string>,
    options?: {multi?: boolean; geo?: boolean}
  ): RDatum<IndexChangeResult>

  indexDrop(indexName: RValue<string>): RDatum<IndexChangeResult>
  indexList(): RDatum<string[]>
  indexRename(
    oldName: RValue<string>,
    newName: RValue<string>,
    options?: {overwrite: boolean}
  ): RDatum<IndexChangeResult>
  indexStatus(...indexName: string[]): RDatum<IndexStatus[]>
  indexWait(...indexName: string[]): RDatum<IndexStatus[]>

  insert(obj: any, options?: InsertOptions): RDatum<WriteResult<T>>
  sync(): RDatum<{synced: number}>

  get(key: any): RSingleSelection<T>
  getAll(key: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>, options?: {index: TSchema['index'] | 'id'}): RSelection<T>
  getAll(key1: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>, key2: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>, options?: {index: TSchema['index'] | 'id'}): RSelection<T>
  getAll(
    key1: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>,
    key2: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>,
    key3: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>,
    options?: {index: TSchema['index'] | 'id'}
  ): RSelection<T>
  getAll(
    key1: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>,
    key2: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>,
    key3: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>,
    key4: RValue<string> | RValue<Date> | RValue<boolean> | RValue<number>,
    options?: {index: TSchema['index'] | 'id'}
  ): RSelection<T>
  getAll(...params: Array<string | Date | boolean | number | {index: TSchema['index'] | 'id'}>): RSelection<T>

  between(
    lowKey: any,
    highKey: any,
    options?: {
      index?: string
      leftBound?: 'open' | 'closed'
      rightBound?: 'open' | 'closed'
    }
  ): RSelection<T>
  getIntersecting(geometry: RDatum, index: {index: TSchema['index'] | 'id'}): RStream<T>
  getNearest(
    geometry: RDatum,
    options?: {
      index: TSchema['index'] | 'id'
      maxResults?: number
      maxDist?: number
      unit?: string
      geoSystem?: string
    }
  ): RStream<T>

  config(): RSingleSelection<DBConfig>
  status(): RDatum<TableStatus>
  rebalance(): RDatum<RebalanceResult>
  reconfigure(options: TableReconfigureOptions): RDatum<ReconfigureResult>
  wait(options?: WaitOptions): RDatum<{ready: 1}>
  getWriteHook(): RDatum<{function: Buffer; query: string}>
  setWriteHook(
    func:
      | null
      | Buffer
      | ((
        context: RDatum<{primary_key: string; timestamp: Date}>,
        oldVal: RDatum<T>,
        newVal: RDatum<T>
      ) => any)
  ): RDatum<{function: Buffer; query: string}>
}
export interface RDatabase<Schema extends UserSchema> {
  grant(
    userName: string,
    options?: {
      read?: boolean
      write?: boolean
      connect?: boolean
      config?: boolean
    }
  ): RDatum<{
    granted: number
    permissions_changes: Array<
      ValueChange<{
        read: boolean
        write: boolean
        connect: boolean
        config: boolean
      }>
    >
  }>
  tableCreate(
    tableName: RValue<string>,
    options?: TableCreateOptions
  ): RDatum<TableChangeResult>
  tableDrop(tableName: RValue<string>): RDatum<TableChangeResult>
  tableList(): RDatum<(keyof Schema)[]>
  table<T extends keyof Schema>(tableName: RValue<T>, options?: TableOptions): RTable<Schema[T]>

  config(): RSingleSelection<TableConfig>
  rebalance(): RDatum<RebalanceResult>
  reconfigure(options?: TableReconfigureOptions): RDatum<ReconfigureResult>
  wait(options?: WaitOptions): RDatum<{ready: number}>
  info(): RDatum<{
    id: string
    name: string
    type: 'DB'
  }>
}

export interface R<Schema extends UserSchema> {
  minval: RValue
  maxval: RValue
  row: RDatum
  monday: RValue
  tuesday: RValue
  wednesday: RValue
  thursday: RValue
  friday: RValue
  saturday: RValue
  sunday: RValue
  january: RValue
  february: RValue
  march: RValue
  april: RValue
  may: RValue
  june: RValue
  july: RValue
  august: RValue
  september: RValue
  october: RValue
  november: RValue
  december: RValue
  // Global
  connect(options: RConnectionOptions): Promise<Connection>
  connectPool(options?: RPoolConnectionOptions): Promise<MasterPool>
  getPoolMaster(): MasterPool | undefined
  waitForHealthy(): Promise<MasterPool>
  setNestingLevel(level: number): void
  setArrayLimit(limit?: number): void
  serialize(query: RQuery): string
  deserialize<T extends RQuery = RQuery>(query: string): T
  // send to DB
  expr<T>(val: T, nestingLevel?: number): RDatum<T>
  <T>(val: T, nestingLevel?: number): RDatum<T>
  // indexes
  desc(indexName: RValue<string> | Func<any>): any
  asc(indexName: RValue<string> | Func<any>): any
  // Object creation
  // Time
  epochTime(epochTime: RValue<number>): RDatum<Date>
  now(): RDatum<Date>
  time(
    year: RValue<number>,
    month: RValue<number>,
    day: RValue<number>,
    hour: RValue<number>,
    minute: RValue<number>,
    second: RValue<number>,
    timezone: RValue<string>
  ): RDatum<Date>
  time(
    year: RValue<number>,
    month: RValue<number>,
    day: RValue<number>,
    timezone: RValue<string>
  ): RDatum<Date>
  ISO8601(
    time: RValue<string>,
    options?: {defaultTimezone: string}
  ): RDatum<Date>
  // Binary
  binary(data: any): RDatum<Buffer>
  // Object
  json(json: RValue<string>): RDatum
  // should be (key: string, value: any...)
  object<T = any>(
    key1: RValue<string>,
    value1: RValue,
    ...keyOrValue: RValue[]
  ): RDatum<T>
  // Geo
  point(longitude: RValue<number>, latitude: RValue<number>): RDatum
  line(
    point1: [number, number],
    point2: [number, number],
    ...points: Array<[number, number]>
  ): RDatum
  line(point1: RDatum, point2: RDatum, ...points: RDatum[]): RDatum
  polygon(
    point1: RDatum,
    point2: RDatum,
    point3: RDatum,
    ...points: RDatum[]
  ): RDatum
  polygon(
    ll1: [number, number],
    ll2: [number, number],
    ll3: [number, number],
    ...longitudeLatitudes: Array<[number, number]>
  ): RDatum
  circle(
    longitudeLatitude: [number, number] | RDatum,
    radius: RValue<number>,
    options?: {
      numVertices?: number
      geoSystem?: 'WGS84' | 'unit_sphere'
      unit?: 'm' | 'km' | 'mi' | 'nm' | 'ft'
      fill?: boolean
    }
  ): RDatum
  geojson(geoJSON: any): RDatum
  // special
  args(arg: Array<RValue<Primitives | object | any[]>> | readonly RValue<Primitives | object | any[]>[]): any
  error(message?: RValue<string>): any
  js(js: RValue<string>, options?: {timeout: number}): RDatum
  literal(): RDatum
  literal<T>(obj: T): RDatum<T>
  random(
    lowBound?: RValue<number>,
    highBound?: RValue<number> | {float: boolean},
    options?: {float: boolean}
  ): RDatum<number>
  range(startValue: RValue<number>, endValue?: RValue<number>): RStream<number>
  uuid(val?: RValue<string>): RDatum<string>
  http(url: RValue<string>, options?: HttpRequestOptions): RDatum
  http(url: RValue<string>, options?: HTTPStreamRequestOptions): RStream

  // top level permissions
  grant(
    userName: string,
    options: {
      read?: boolean
      write?: boolean
      connect?: boolean
      config?: boolean
    }
  ): RDatum<{
    granted: number
    permissions_changes: Array<
      ValueChange<{
        read: boolean
        write: boolean
        connect: boolean
        config: boolean
      }>
    >
  }>
  // Database management
  db(dbName: string): RDatabase<Schema>
  dbCreate(dbName: RValue<string>): RDatum<DBChangeResult>
  dbDrop(dbName: RValue<string>): RDatum<DBChangeResult>
  dbList(): RDatum<string[]>
  // Table management for default database
  table<T extends keyof Schema>(tableName: RValue<T>, options?: TableOptions): RTable<Schema[T]>
  tableCreate(
    tableName: RValue<string>,
    options?: TableCreateOptions
  ): RDatum<TableChangeResult>
  tableDrop(tableName: RValue<string>): RDatum<TableChangeResult>
  tableList(): RDatum<(keyof Schema)[]>

  // Additional -
  // DATABASE / TABLE
  config(database: RDatabase<Schema>): RSingleSelection<DBConfig>
  config<T extends keyof Schema>(table: RTable<Schema[T]>): RSingleSelection<TableConfig>
  rebalance(database: RDatabase<Schema>): RDatum<RebalanceResult>
  rebalance<T extends keyof Schema>(table: RTable<Schema[T]>): RDatum<RebalanceResult>
  reconfigure(
    database: RDatabase<Schema>,
    options?: TableReconfigureOptions
  ): RDatum<ReconfigureResult>
  reconfigure<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    options: TableReconfigureOptions
  ): RDatum<ReconfigureResult>
  wait(database: RDatabase<Schema>, options?: WaitOptions): RDatum<{ready: number}>
  wait<T extends keyof Schema>(table: RTable<Schema[T]>, options?: WaitOptions): RDatum<{ready: 1}>
  indexCreate<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    indexName: RValue<string>,
    indexFunction?: RDatum | Buffer | RDatum[] | ((row: RDatum) => any),
    options?: IndexOptions
  ): RDatum<IndexChangeResult>
  indexCreate<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    indexName: RValue<string>,
    options?: {multi: boolean; geo: boolean}
  ): RDatum<IndexChangeResult>

  indexDrop<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    indexName: RValue<string>
  ): RDatum<IndexChangeResult>
  indexList<T extends keyof Schema>(table: RTable<Schema[T]>): RDatum<string[]>
  indexRename<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    oldName: RValue<string>,
    newName: RValue<string>,
    options?: {overwrite: boolean}
  ): RDatum<IndexChangeResult>
  indexStatus<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    ...indexName: string[]
  ): RDatum<IndexStatus[]>
  indexWait<T extends keyof Schema>(table: RTable<Schema[T]>, ...indexName: string[]): RDatum<IndexStatus[]>

  insert<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    obj: any,
    options?: InsertOptions
  ): RDatum<WriteResult<T>>
  sync<T extends keyof Schema>(table: RTable<Schema[T]>): RDatum<{synced: number}>

  get<T extends keyof Schema>(table: RTable<Schema[T]>, key: any): RSingleSelection<T>
  getAll<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    key: any,
    options?: {index: Schema[T]['index']}
  ): RSelection<T>
  getAll<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    key1: any,
    key2: any,
    options?: {index: Schema[T]['index']}
  ): RSelection<T>
  getAll<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    key1: any,
    key2: any,
    key3: any,
    options?: {index: Schema[T]['index']}
  ): RSelection<T>
  getAll<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    key1: any,
    key2: any,
    key3: any,
    key4: any,
    options?: {index: Schema[T]['index']}
  ): RSelection<T>

  between<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    lowKey: any,
    highKey: any,
    options?: {
      index?: string
      leftBound?: 'open' | 'closed'
      rightBound?: 'open' | 'closed'
    }
  ): RSelection<T>
  getIntersecting<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    geometry: RDatum,
    index: {index: Schema[T]['index']}
  ): RStream<T>
  getNearest<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    geometry: RDatum,
    options?: {
      index: Schema[T]['index']
      maxResults?: number
      maxDist?: number
      unit?: string
      geoSystem?: string
    }
  ): RStream<T>

  status<T extends keyof Schema>(table: RTable<Schema[T]>): RDatum<TableStatus>
  getWriteHook<T extends keyof Schema>(
    table: RTable<Schema[T]>
  ): RDatum<{function: Buffer; query: string}>
  setWriteHook<T extends keyof Schema>(
    table: RTable<Schema[T]>,
    func:
      | null
      | Buffer
      | ((
        context: RDatum<{primary_key: string; timestamp: Date}>,
        oldVal: RDatum<T>,
        newVal: RDatum<T>
      ) => any)
  ): RDatum<{function: Buffer; query: string}>

  // SELECTION / SINGLE SELECTION
  update<T>(
    selection: RSelection<T> | RSingleSelection<T>,
    obj: RValue<DeepPartial<T>> | ((arg: RDatum<T>) => any),
    options?: UpdateOptions
  ): RDatum<WriteResult<T>>
  replace<T>(
    selection: RSelection<T> | RSingleSelection<T>,
    obj: RValue<T> | ((arg: RDatum<T>) => any),
    options?: UpdateOptions
  ): RDatum<WriteResult<T>>
  delete<T>(
    selection: RSelection<T> | RSingleSelection<T>,
    options?: DeleteOptions
  ): RDatum<WriteResult<T>>
  changes<T>(
    selection: RSingleSelection<T> | RStream<T>,
    options?: ChangesOptions
  ): RFeed<Changes<T>>

  // FEED / STREAM / DATUM<ARRAY>
  forEach<
    T,
    U = any,
    RES extends
    | RDatum<WriteResult<U>>
    | RDatum<DBChangeResult>
    | RDatum<IndexChangeResult> = RDatum<WriteResult<U>>
  >(
    stream: RStream<T>,
    func: (res: RDatum<T>) => RES
  ): RES
  forEach<
    T,
    U = any,
    ONE = T extends Array<infer T1> ? T1 : never,
    RES extends
    | RDatum<WriteResult<U>>
    | RDatum<DBChangeResult>
    | RDatum<IndexChangeResult> = RDatum<WriteResult<U>>
  >(
    datum: RDatum<T>,
    func: (res: RDatum<ONE>) => RES
  ): T extends any[] ? RES : never
  getField<T, U extends keyof T>(
    stream: RStream<T>,
    fieldName: RValue<U>
  ): RStream<T[U]>
  getField<T, U extends keyof T>(
    feed: RFeed<T>,
    fieldName: RValue<U>
  ): RFeed<T[U]>
  getField<T, U extends keyof T>(
    datum: RDatum<T>,
    attribute: RValue<U>
  ): RDatum<T[U]>

  innerJoin<T, U>(
    stream: RStream<T> | RValue<T[]>,
    other: RStream<U> | RValue<U[]>,
    predicate: (doc1: RDatum<T>, doc2: RDatum<U>) => RValue<boolean>
  ): RStream<JoinResult<T, U>>
  outerJoin<T, U>(
    stream: RStream<T> | RValue<T[]>,
    other: RStream<U> | RValue<T[]>,
    predicate: (doc1: RDatum<T>, doc2: RDatum<U>) => RValue<boolean>
  ): RStream<JoinResult<T, U>> // actually left join
  eqJoin<T, U extends keyof Schema>(
    stream: RStream<T> | RValue<T[]>,
    fieldOrPredicate: RValue<keyof T> | Func<T, boolean>,
    rightTable: RTable<Schema[U]>,
    options?: {index: Schema[U]['index'] | 'id'}
  ): RStream<JoinResult<T, U>>

  zip<T>(
    stream: RStream<T>
  ): T extends JoinResult<infer U1, infer U2> ? U1 & U2 : never

  union<T, U = T extends Array<infer TArr> ? TArr : T>(
    stream: RValue<U[]> | RStream<U>,
    ...other: Array<RStream<U> | RValue<U[]> | {interleave: boolean | string}>
  ): RStream<U>
  union<T, U = T extends Array<infer TArr> ? TArr : T>(
    stream: RValue<U[]> | RStream<U> | RFeed<U>,
    ...other: Array<
      RStream<U> | RValue<U[]> | RFeed<U> | {interleave: boolean | string}
    >
  ): RFeed<U>
  map<T, U = any>(
    stream: RStream<T>,
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RStream<U>
  map<T, U = any>(
    feed: RFeed<T>,
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RFeed<U>
  map<T, Res = any, U = T extends Array<infer T1> ? T1 : never>(
    datum: RDatum<T>,
    ...args: Array<RStream | ((arg: RDatum<U>, ...args: RDatum[]) => any)>
  ): T extends any[] ? RDatum<Res[]> : never
  concatMap<T, U = any>(
    feed: RFeed<T>,
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RFeed<U>
  concatMap<T, U = any>(
    stream: RStream<T>,
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RStream<U>
  concatMap<T, Res = any, U = T extends Array<infer T1> ? T1 : never>(
    datum: RDatum<T>,
    ...args: Array<RStream | ((arg: RDatum<U>, ...args: RDatum[]) => any)>
  ): T extends any[] ? RDatum<Res[]> : never
  withFields<T>(
    feed: RFeed<T>,
    ...fields: MultiFieldSelector[]
  ): RFeed<Partial<T>>
  withFields<T>(
    stream: RStream<T>,
    ...fields: MultiFieldSelector[]
  ): RStream<Partial<T>>
  withFields<T>(
    datum: RDatum<T>,
    ...fields: MultiFieldSelector[]
  ): T extends Array<infer T1> ? RDatum<Array<Partial<T1>>> : never
  hasFields<T>(feed: RFeed<T>, ...fields: MultiFieldSelector[]): RFeed<T>
  hasFields<T>(stream: RStream<T>, ...fields: MultiFieldSelector[]): RStream<T>
  hasFields<T>(
    datum: RDatum<T>,
    ...fields: string[]
  ): T extends Array<unknown> ? RDatum<T> : RDatum<boolean>
  filter<T>(
    feed: RFeed<T>,
    predicate: DeepPartial<T> | ((doc: RDatum<T>) => RValue<boolean>),
    options?: {default: boolean}
  ): RFeed<T>
  filter<T>(
    stream: RStream<T>,
    predicate: DeepPartial<T> | ((doc: RDatum<T>) => RValue<boolean>),
    options?: {default: boolean}
  ): RStream<T>
  filter<T, U = T extends Array<infer T1> ? T1 : never>(
    datum: RDatum<T>,
    predicate: DeepPartial<T> | ((doc: RDatum<U>) => RValue<boolean>),
    options?: {default: boolean}
  ): RDatum<T>
  includes<T>(
    datum: RDatum<T>,
    geometry: RDatum
  ): T extends Array<unknown> ? RDatum<T> : never
  includes<T>(feed: RFeed<T>, geometry: RDatum): RFeed<T>
  includes<T>(stream: RStream<T>, geometry: RDatum): RStream<T>
  intersects<T>(
    datum: RDatum<T>,
    geometry: RDatum
  ): T extends Array<unknown> ? RDatum<T> : never
  intersects<T>(feed: RFeed<T>, geometry: RDatum): RFeed<T>
  intersects<T>(stream: RStream<T>, geometry: RDatum): RStream<T>
  contains<T, U = T extends Array<infer T1> ? T1 : never>(
    datum: RDatum<T>,
    val1: any[] | null | string | number | object | Func<U>,
    ...value: Array<any[] | null | string | number | object | Func<U>>
  ): T extends Array<unknown> ? RDatum<boolean> : never // also predicate
  contains<T>(
    stream: RStream<T>,
    val1: any[] | null | string | number | object | Func<T>,
    ...value: Array<any[] | null | string | number | object | Func<T>>
  ): RDatum<boolean>
  orderBy<T, U = T extends Array<infer T1> ? T1 : never>(
    datum: RDatum<T>,
    ...fields: Array<FieldSelector<T>>
  ): T extends Array<unknown> ? RDatum<T> : never
  orderBy<T, U extends RStream<T>>(
    stream: U,
    ...fieldOrIndex: Array<FieldSelector<T> | {index: string}>
  ): U // also r.desc(string)
  group<
    T,
    F extends T extends Array<infer T1> ? keyof T1 : never,
    D extends T extends Array<infer T2> ? T2 : never
  >(
    datum: RDatum<T>,
    ...fieldOrFunc: Array<FieldSelector<T>>
  ): T extends Array<unknown> ? RDatum : never // <GroupResults<T[U], T[]>>;
  group<T, U extends keyof T>(
    stream: RStream<T>,
    ...fieldOrFunc: Array<
      U | ((row: RDatum<T>) => any) | {index?: string; multi?: boolean}
    >
  ): T extends Array<unknown> ? RDatum : never // <GroupResults<T[U], T[]>>;
  count<T, U = T extends Array<infer T1> ? T1 : never>(
    datum: RDatum<T>,
    value?: RValue<U> | Func<U, boolean>
  ): T extends Array<unknown> ? RDatum<number> : never
  count<T>(
    stream: RStream<T>,
    value?: RValue<T> | Func<T, boolean>
  ): RDatum<number>
  sum<T, U = T extends Array<infer T1> ? T1 : never>(
    datum: RDatum<T>,
    value?: FieldSelector<U, number | null>
  ): T extends Array<unknown> ? RDatum<number> : never
  sum<T>(
    stream: RStream<T>,
    value?: RValue<T> | Func<T, number | null>
  ): RDatum<number>
  avg<T, U = T extends Array<infer T1> ? T1 : never>(
    datum: RValue<T>,
    value?: FieldSelector<U, number | null>
  ): T extends Array<unknown> ? RDatum<number> : never
  avg<T>(
    stream: RStream<T>,
    value?: RValue<T> | Func<T, number | null>
  ): RDatum<number>
  min<T, U = T extends Array<infer T1> ? T1 : never>(
    datum: RValue<T>,
    value?: FieldSelector<U, number | null>
  ): T extends Array<unknown> ? RDatum<number> : never
  min<T>(
    stream: RStream<T>,
    value?: RValue<T> | Func<T, number | null> | {index: string}
  ): RDatum<number>
  max<T, U = T extends Array<infer T1> ? T1 : never>(
    datum: RValue<T>,
    value?: FieldSelector<U, number | null>
  ): T extends Array<unknown> ? RDatum<number> : never
  max<T>(
    stream: RStream<T>,
    value?: RValue<T> | Func<T, number | null> | {index: string}
  ): RDatum<number>
  reduce<T, U = any, ONE = T extends Array<infer T1> ? T1 : never>(
    datum: RValue<T>,
    reduceFunction: (left: RDatum<ONE>, right: RDatum<ONE>) => any
  ): T extends Array<unknown> ? RDatum<U> : never
  reduce<T, U = any>(
    stream: RStream<T>,
    reduceFunction: (left: RDatum<T>, right: RDatum<T>) => any
  ): RDatum<U>
  fold<T, ACC = any, RES = any, ONE = T extends Array<infer T1> ? T1 : never>(
    datum: RValue<T>,
    base: any,
    foldFunction: (acc: RDatum<ACC>, next: RDatum<ONE>) => any, // this any is ACC
    options?: {
      emit?: (
        acc: RDatum<ACC>,
        next: RDatum<ONE>,
        // tslint:disable-next-line:variable-name
        new_acc: RDatum<ACC>
      ) => any[] // this any is RES
      finalEmit?: (acc: RStream) => any[] // this any is also RES
    }
  ): T extends Array<unknown> ? RDatum<RES[]> : never
  fold<T, ACC = any, RES = any>(
    feed: RFeed<T>,
    base: any,
    foldFunction: (acc: RDatum<ACC>, next: RDatum<T>) => any, // this any is ACC
    options: {
      // tslint:disable-next-line:variable-name
      emit: (acc: RDatum<ACC>, next: RDatum<T>, new_acc: RDatum<ACC>) => any[] // this any is RES
    }
  ): RFeed<RES>
  fold<T, ACC = any, RES = any>(
    stream: RStream<T>,
    base: any,
    foldFunction: (acc: RDatum<ACC>, next: RDatum<T>) => any, // this any is ACC
    options?: {
      // tslint:disable-next-line:variable-name
      emit?: (acc: RDatum<ACC>, next: RDatum<T>, new_acc: RDatum<ACC>) => any[] // this any is RES
      finalEmit?: (acc: RStream) => any[] // this any is also RES
    }
  ): RStream<RES>
  distinct<T>(datum: RValue<T[]>): RDatum<T[]>
  distinct<T>(stream: RStream<T>): RStream<T>
  distinct<T, TIndex = any>(
    stream: RStream<T>,
    index: {index: string}
  ): RStream<TIndex>
  pluck<T>(
    datum: RDatum<T>,
    ...fields: MultiFieldSelector[]
  ): T extends Array<infer T1> ? RDatum<Array<Partial<T1>>> : never
  pluck<T>(feed: RFeed<T>, ...fields: MultiFieldSelector[]): RFeed<Partial<T>>
  pluck<T>(
    stream: RStream<T>,
    ...fields: MultiFieldSelector[]
  ): RStream<Partial<T>>
  without<T>(
    datum: RDatum<T>,
    ...fields: MultiFieldSelector[]
  ): T extends Array<infer T1> ? RDatum<Array<Partial<T1>>> : never
  without<T>(
    feed: RFeed<T>,
    ...fields: MultiFieldSelector[]
  ): RFeed<Partial<T>>
  without<T>(
    stream: RStream<T>,
    ...fields: MultiFieldSelector[]
  ): RStream<Partial<T>>
  merge<U = any>(
    obj: object | RDatum,
    ...objects: Array<object | RDatum | ((arg: RDatum) => any)>
  ): RDatum<U>
  merge<U = any>(
    stream: RStream,
    ...objects: Array<object | RDatum | ((arg: RDatum) => any)>
  ): RStream<U>
  skip<T extends any[]>(datum: RDatum<T>, n: RValue<number>): RDatum<T>
  skip<T>(stream: RStream<T>, n: RValue<number>): RStream<T>
  limit<T extends any[]>(datum: RDatum<T>, n: RValue<number>): RDatum<T>
  limit<T>(stream: RStream<T>, n: RValue<number>): RStream<T>
  slice<T extends any[]>(
    datum: RDatum<T>,
    start: RValue<number>,
    end?: RValue<number>,
    options?: {leftBound?: 'open' | 'closed'; rightBound?: 'open' | 'closed'}
  ): RDatum<T>
  slice<T extends any[]>(
    datum: RDatum<T>,
    start: RValue<number>,
    options?: {leftBound?: 'open' | 'closed'; rightBound?: 'open' | 'closed'}
  ): RDatum<T>
  slice<T>(
    stream: RStream<T>,
    start: RValue<number>,
    end?: RValue<number>,
    options?: {leftBound?: 'open' | 'closed'; rightBound?: 'open' | 'closed'}
  ): RStream<T>
  nth<T>(
    datum: RDatum<T>,
    attribute: RValue<number>
  ): T extends Array<infer T1> ? RDatum<T1> : never
  nth<T>(stream: RStream<T>, n: RValue<number>): RDatum<T>
  nth<T>(
    datum: RDatum<T>,
    attribute: RValue<number>
  ): T extends Array<infer T1> ? RDatum<T1> : never
  sample<T>(
    datum: RDatum<T>,
    n: RValue<number>
  ): T extends Array<unknown> ? RDatum<T> : never
  sample<T>(stream: RStream<T>, n: RValue<number>): RDatum<T[]>
  offsetsOf<T, U = T extends Array<infer T1> ? T1 : never>(
    datum: RDatum<T>,
    single: RValue<U> | Func<U, boolean>
  ): T extends Array<unknown> ? RDatum<number[]> : never
  offsetsOf<T>(
    stream: RStream<T>,
    single: RValue<T> | Func<T, boolean>
  ): RDatum<number[]>

  isEmpty<T>(
    datum: RDatum<T>
  ): T extends Array<unknown> ? RDatum<boolean> : never
  isEmpty<T>(stream: RStream<T>): RDatum<boolean>

  coerceTo<T>(stream: RStream<T>, type: 'array'): RDatum<T[]>
  coerceTo<T, U = any>(stream: RStream<T>, type: 'object'): RDatum<U>

  // DATUM

  coerceTo<T, U = any>(
    datum: RDatum<T>,
    type: 'object'
  ): T extends Array<unknown> ? RDatum<U> : never
  coerceTo<T>(datum: RDatum<T>, type: 'string'): RDatum<string>
  coerceTo<T>(datum: RDatum<T>, type: 'array'): RDatum<any[]>
  coerceTo<T>(
    datum: RDatum<T>,
    type: 'number'
  ): T extends string ? RDatum<number> : never
  coerceTo<T>(
    datum: RDatum<T>,
    type: 'binary'
  ): T extends string ? RDatum<Buffer> : never

  do<T extends Primitives | object, U>(
    datum: RValue<T>,
    ...args: Array<
      RDatum | Primitives | object | ((arg: RDatum<T>, ...args: RDatum[]) => U)
    >
  ): U extends RStream ? RStream : RDatum

  default<T, U>(datum: RDatum<T>, value: U): RDatum<T | U>
  // Works only if T is an array
  append<T, U>(
    datum: RDatum<T>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never
  prepend<T, U>(
    datum: RDatum<T>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never
  difference<T, U>(
    datum: RDatum<T>,
    value: RValue<U[]>
  ): T extends U[] ? RDatum<T> : never
  setInsert<T, U>(
    datum: RDatum<T>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never
  setUnion<T, U>(
    datum: RDatum<T>,
    value: RValue<U[]>
  ): T extends U[] ? RDatum<T> : never
  setIntersection<T, U>(
    datum: RDatum<T>,
    value: RValue<U[]>
  ): T extends U[] ? RDatum<T> : never
  setDifference<T, U>(
    datum: RDatum<T>,
    value: RValue<U[]>
  ): T extends U[] ? RDatum<T> : never
  insertAt<T, U>(
    datum: RDatum<T>,
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never
  changeAt<T, U>(
    datum: RDatum<T>,
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never
  spliceAt<T, U>(
    datum: RDatum<T>,
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never
  deleteAt<T, U>(
    datum: RDatum<T>,
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never
  ungroup(datum: RDatum): RDatum<Array<GroupResults<any, any>>>

  // Works only if T is a string

  match(
    datum: RValue<string>,
    regexp: RValue<string>
  ): RDatum<MatchResults | null>
  split(
    datum: RValue<string>,
    seperator?: RValue<string>,
    maxSplits?: RValue<number>
  ): RDatum<string[]>
  upcase(datum: RValue<string>): RDatum<string>
  downcase(datum: RValue<string>): RDatum<string>
  add<T extends string | number | Date>(
    datum: RValue<T>,
    ...str: Array<RValue<string> | RValue<number>>
  ): RDatum<T>
  gt<T extends string | number | Date>(
    datum: RValue<T>,
    ...value: Array<RValue<string> | RValue<number> | RValue<Date>>
  ): RDatum<boolean>
  ge<T extends string | number | Date>(
    datum: RValue<T>,
    ...value: Array<RValue<string> | RValue<number> | RValue<Date>>
  ): RDatum<boolean>
  lt<T extends string | number | Date>(
    datum: RValue<T>,
    ...value: Array<RValue<string> | RValue<number> | RValue<Date>>
  ): RDatum<boolean>
  le<T extends string | number | Date>(
    datum: RValue<T>,
    ...value: Array<RValue<string> | RValue<number> | RValue<Date>>
  ): RDatum<boolean>
  // Works only for numbers
  sub<T extends number | Date>(
    datum: RValue<T>,
    ...num: Array<RValue<number>>
  ): RDatum<T>
  sub(datum: RValue<Date>, date: RValue<Date>): RDatum<number>
  mul(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>
  div(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>
  mod(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>

  bitAnd(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>
  bitOr(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>
  bitXor(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>
  bitNot(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>
  bitSal(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>
  bitShl(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>
  bitSar(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>
  bitSht(datum: RValue<number>, ...num: Array<RValue<number>>): RDatum<number>

  round(datum: RValue<number>): RDatum<number>
  ceil(datum: RValue<number>): RDatum<number>
  floor(datum: RValue<number>): RDatum<number>
  // Works only for bool
  branch(
    datum: RValue<boolean>,
    trueBranch: any,
    falseBranchOrTest: any,
    ...branches: any[]
  ): RDatum<any>
  and(datum: RValue<boolean>, ...bool: Array<RValue<boolean>>): RDatum<boolean>
  or(datum: RValue<boolean>, ...bool: Array<RValue<boolean>>): RDatum<boolean>
  not(datum: RValue<boolean>): RDatum<boolean>
  // Works only for Date
  inTimezone(datum: RValue<Date>, timezone: string): RDatum<Date>
  timezone(datum: RValue<Date>): RDatum<string>
  during(
    datum: RValue<Date>,
    start: RValue<Date>,
    end: RValue<Date>,
    options?: {leftBound: 'open' | 'closed'; rightBound: 'open' | 'closed'}
  ): RDatum<boolean>
  date(datum: RValue<Date>): RDatum<Date>
  timeOfDay(datum: RValue<Date>): RDatum<number>
  year(datum: RValue<Date>): RDatum<number>
  month(datum: RValue<Date>): RDatum<number>
  day(datum: RValue<Date>): RDatum<number>
  dayOfWeek(datum: RValue<Date>): RDatum<number>
  dayOfYear(datum: RValue<Date>): RDatum<number>
  hours(datum: RValue<Date>): RDatum<number>
  minutes(datum: RValue<Date>): RDatum<number>
  seconds(datum: RValue<Date>): RDatum<number>
  toISO8601(datum: RValue<Date>): RDatum<string>
  toEpochTime(datum: RValue<Date>): RDatum<number>
  // Works only for geo
  distance<T>(
    datum: RDatum<T>,
    geo: RValue,
    options?: {geoSystem: string; unit: string}
  ): RDatum<number>
  toGeojson<T>(datum: RDatum<T>): RDatum
  // Works only for line
  fill<T>(datum: RDatum<T>): RDatum
  polygonSub<T>(datum: RDatum<T>, polygon2: RValue): RDatum

  toJsonString<T>(datum: RDatum<T>): RDatum<string>
  toJSON<T>(datum: RDatum<T>): RDatum<string>

  eq(datum: RValue, ...value: RValue[]): RDatum<boolean>
  ne(datum: RValue, ...value: RValue[]): RDatum<boolean>

  keys<T>(datum: RDatum<T>): RDatum<string[]>
  values<T>(datum: RDatum<T>): RDatum<Array<T[keyof T]>>

  typeOf(query: any): RDatum<string>
  info(
    query: RQuery
  ): RDatum<{
    value?: string
    db?: {id: string; name: string; type: string}
    doc_count_estimates?: number[]
    id?: string
    indexes?: string[]
    name?: string
    primary_key?: string
    type: string
  }>
  info(
    db: RDatabase<Schema>
  ): RDatum<{
    id: string
    name: string,
    type: 'DB'
  }>
}

//#endregion operations
