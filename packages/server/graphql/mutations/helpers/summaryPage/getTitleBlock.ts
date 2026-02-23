import dayjs from 'dayjs'
import type {AnyMeeting} from '../../../../postgres/types/Meeting'

export const getTitleBlock = (meeting: AnyMeeting) => {
  const {name: meetingName, endedAt} = meeting
  const endTime = dayjs(endedAt)
  const endLabel = endTime.format('MMM D, YYYY')
  return {
    type: 'heading' as const,
    attrs: {level: 1} as const,
    content: [{type: 'text' as const, text: `${meetingName} - ${endLabel}`}]
  }
}
