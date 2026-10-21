import type {Selectable} from 'kysely'
import type {ReportQuestion as ReportQuestionRow} from '../../../postgres/types/pg'
import {CipherId} from '../../../utils/CipherId'
import type {ReportQuestionResolvers} from '../resolverTypes'

export type ReportQuestionSource = Selectable<ReportQuestionRow>

const ReportQuestion: ReportQuestionResolvers = {
  id: ({id}) => CipherId.toClient(id, 'ReportQuestion'),
  spec: ({spec}) => (spec === null ? null : JSON.stringify(spec))
}

export default ReportQuestion
