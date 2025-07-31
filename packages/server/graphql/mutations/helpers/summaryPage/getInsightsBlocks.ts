import dayjs from 'dayjs'
import {markdownToTipTap} from '../../../../../client/shared/tiptap/markdownToTipTap'
import {quickHash} from '../../../../../client/shared/utils/quickHash'
import {
  NOT_ENOUGH_DATA_FOR_INSIGHTS,
  summaryInsightsPrompt
} from '../../../../dataloader/aiLoaderMakers'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'

const NOT_ENOUGH_DATA_BLOCK = [
  {type: 'paragraph', content: [{type: 'text', text: NOT_ENOUGH_DATA_FOR_INSIGHTS}]}
]

export const getInsightsBlocks = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId, createdAt, endedAt} = meeting
  const startTime = dayjs(createdAt)
  const endTime = dayjs(endedAt)
  const {content, error} = await dataLoader.get('meetingInsightsContent').load(meetingId)
  const startTimeRange = startTime.subtract(1, 'hour').toISOString()
  const endTimeRange = endTime.add(1, 'hour').toISOString()
  const getBlockContent = (
    content: string | undefined,
    error?: 'nodata' | 'disabled' | 'modelFail'
  ) => {
    if (content) return markdownToTipTap(content)
    if (error === 'disabled') return []
    if (error === 'nodata') return NOT_ENOUGH_DATA_BLOCK
    return {type: 'paragraph', content: [{type: 'text', text: 'Could not reach AI Server'}]}
  }
  const blockContent = getBlockContent(content, error)
  return [
    {type: 'paragraph'},
    {
      type: 'insightsBlock',
      attrs: {
        id: crypto.randomUUID(),
        editing: false,
        teamIds: [teamId],
        meetingTypes: ['retrospective'],
        after: startTimeRange,
        before: endTimeRange,
        meetingIds: [meetingId],
        title: 'Top Topics',
        hash: await quickHash([meetingId, summaryInsightsPrompt]),
        prompt: summaryInsightsPrompt,
        error
      },
      content: blockContent
    }
  ]
}
