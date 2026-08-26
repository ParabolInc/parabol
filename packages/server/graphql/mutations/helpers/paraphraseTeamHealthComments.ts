import type {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {canRevealTeamHealth} from '../../public/types/helpers/canRevealTeamHealth'

// Run once, as the meeting ends and its answers become readable. Every surface that publishes a
// comment reads commentParaphrased and nothing else, so a comment this leaves unparaphrased is a
// comment that never reaches the team — which is the right failure direction.
const paraphraseTeamHealthComments = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  // nothing below the floor is ever published, so paraphrasing it would be spend for no reader
  if (!(await canRevealTeamHealth(meetingId, dataLoader))) return
  const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
  const pending = responses.filter(
    (response): response is typeof response & {comment: string} =>
      !!response.comment && !response.commentParaphrased
  )
  if (pending.length === 0) return

  const manager = new OpenAIServerManager()
  const paraphrases = await manager.paraphraseTeamHealthComments(
    pending.map(({comment}) => comment)
  )
  if (!paraphrases) return

  const pg = getKysely()
  await Promise.all(
    pending.map((response, idx) => {
      const commentParaphrased = paraphrases[idx]
      if (!commentParaphrased) return undefined
      return pg
        .updateTable('TeamHealthResponse')
        .set({commentParaphrased})
        .where('id', '=', response.id)
        .execute()
    })
  )
  dataLoader.get('teamHealthResponsesByMeetingId').clear(meetingId)
}

export default paraphraseTeamHealthComments
