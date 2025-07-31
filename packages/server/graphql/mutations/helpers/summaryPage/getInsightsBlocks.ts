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
  const useAI = error === 'disabled'
  const notEnoughData = error === 'nodata'
  const startTimeRange = startTime.subtract(1, 'hour').toISOString()
  const endTimeRange = endTime.add(1, 'hour').toISOString()
  const blockContent = useAI
    ? notEnoughData
      ? NOT_ENOUGH_DATA_BLOCK
      : markdownToTipTap(content!)
    : []
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
