import dayjs from 'dayjs'
import type {AnyMeeting} from '../../../../postgres/types/Meeting'

export const getTitleBlock = (meeting: AnyMeeting) => {
  const {name: meetingName, endedAt} = meeting
  const endTime = dayjs(endedAt)
  const endLabel = endTime.format('MMM D, YYYY')
  return {
    type: 'heading',
    attrs: {level: 1},
    content: [{type: 'text', text: `${meetingName} - ${endLabel}`}]
  }
}
