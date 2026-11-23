import {z} from 'zod'
import type {TaskStatusEnum} from '../graphql/public/resolverTypes'

const TASK_STATUSES = ['active', 'stuck', 'done', 'future'] as const satisfies TaskStatusEnum[]

const taskStatusSchema = z.enum(TASK_STATUSES)

export default taskStatusSchema
