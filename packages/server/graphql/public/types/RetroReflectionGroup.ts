import {Selectable} from 'kysely'
import {RetroReflectionGroup as TRetroReflectionGroup} from '../../../postgres/pg'
import {RetroReflectionGroupResolvers} from '../resolverTypes'

export interface RetroReflectionGroupSource extends Selectable<TRetroReflectionGroup> {}

const RetroReflectionGroup: RetroReflectionGroupResolvers = {}

export default RetroReflectionGroup
