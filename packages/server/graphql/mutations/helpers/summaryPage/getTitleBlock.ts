import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import type {AnyMeeting} from '../../../../postgres/types/Meeting'

dayjs.extend(utc)

export const getTitleBlock = (meeting: AnyMeeting) => {
  const {name: meetingName, endedAt} = meeting
  const endTime = dayjs.utc(endedAt)
  const endLabel = endTime.format('MMM D, YYYY')
  return {
    type: 'heading' as const,
    attrs: {level: 1} as const,
    content: [{type: 'text' as const, text: `${meetingName} - ${endLabel}`}]
  }
}
