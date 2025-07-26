import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import isValid from '../../../isValid'

export const getParticipantBlocks = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  const memberCount = meetingMembers.length
  const title = `${memberCount} ${plural(memberCount, 'Participant')}`
  const userIds = meetingMembers.map(({userId}) => userId)
  const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
  return [
    {
      type: 'heading',
      attrs: {level: 2},
      content: [{type: 'text', text: title}]
    },
    {
      type: 'bulletList',
      attrs: {tight: true},
      content: users.map((user) => {
        const {preferredName} = user
        return {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{type: 'text', text: preferredName}]
            }
          ]
        }
      })
    }
  ]
}
