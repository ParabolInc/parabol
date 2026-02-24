import getKysely from '../../../../postgres/getKysely'
import {createNewPage} from '../../../../utils/tiptap/createNewPage'
import type {DataLoaderWorker} from '../../../graphql'

export const ensureMeetingTOCPage = async (
  userId: string,
  teamId: string,
  dataLoader: DataLoaderWorker,
  mutatorId?: string | undefined
) => {
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (!team.meetingTOCpageId) {
    const tocPage = await createNewPage(
      {
        userId,
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: {level: 1},
              content: [{type: 'text', text: 'Meeting Summaries'}]
            }
          ]
        },
        teamId
      },
      dataLoader,
      mutatorId
    )
    await getKysely()
      .updateTable('Team')
      .set({meetingTOCpageId: tocPage.id})
      .where('id', '=', teamId)
      .execute()
    team.meetingTOCpageId = tocPage.id
  }
  return team.meetingTOCpageId
}
