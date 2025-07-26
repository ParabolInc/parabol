import dayjs from 'dayjs'
import makeAppURL from '../../../../../client/utils/makeAppURL'
import appOrigin from '../../../../appOrigin'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {AnyMeeting} from '../../../../postgres/types/Meeting'

export const getSubtitleBlock = async (meeting: AnyMeeting, dataLoader: DataLoaderInstance) => {
  const {endedAt, teamId, createdAt} = meeting
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {name: teamName} = team
  const startTime = dayjs(createdAt)
  const endTime = dayjs(endedAt)
  const startLabel = startTime.format('MMM D, YYYY')
  const endLabel = endTime.format('MMM D, YYYY')
  const teamHomeURL = makeAppURL(appOrigin, `team/${teamId}`)
  const durationLabel =
    startLabel === endLabel ? startLabel : `${startTime.format('MMM D')} - ${endLabel}`
  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: teamName,
        marks: [
          {
            type: 'link',
            attrs: {
              href: teamHomeURL,
              target: '_blank',
              rel: 'noopener noreferrer nofollow',
              class: 'link'
            }
          },
          {type: 'bold', attrs: {}}
        ]
      },
      {
        type: 'text',
        text: ` — ${durationLabel}`,
        marks: [{type: 'bold', attrs: {}}]
      }
    ]
  }
}
