import getPg from '../getPg'
import {
  getMeetingTemplatesByIdsQuery,
  IGetMeetingTemplatesByIdsQueryResult
} from './generated/getMeetingTemplatesByIdsQuery'

export interface MeetingTemplate extends IGetMeetingTemplatesByIdsQueryResult {}

const getMeetingTemplatesByIds = async (ids: readonly string[]) =>
  getMeetingTemplatesByIdsQuery.run({ids}, getPg())

export default getMeetingTemplatesByIds
