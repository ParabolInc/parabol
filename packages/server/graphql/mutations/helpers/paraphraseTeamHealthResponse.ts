import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import logError from '../../../utils/logError'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'

// An empty commentParaphrased means "an anonymous comment is waiting on its paraphrase". Readers
// only ever show a non-empty paraphrase, so the raw comment cannot leak while the job is in flight
export const PENDING_PARAPHRASE = ''

// TeamHealthResponse.commentParaphrased is a varchar(2000)
const MAX_PARAPHRASE_LENGTH = 2000

interface Response {
  meetingId: string
  questionId: number
  userId: string
  comment: string
}

/**
 * Rewrites an anonymous comment so the author's voice can't identify them, then finalizes the row
 * the mutation left pending. Detached from the mutation, since the author shouldn't wait on the LLM
 * and nobody may read the result until the meeting ends.
 */
const paraphraseTeamHealthResponse = async (response: Response) => {
  const {meetingId, questionId, userId, comment} = response
  const dataLoader = getNewDataLoader('paraphraseTeamHealthResponse')
  let paraphrased: string | null = null
  try {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const team = await dataLoader.get('teams').loadNonNull(meeting.teamId)
    const org = await dataLoader.get('organizations').loadNonNull(team.orgId)
    // the client hides the anonymous option when the org or the instance has no AI, so this is the
    // stale-client path: fail closed and drop the comment rather than show it as the author wrote it
    if (org.useAI) {
      const question = await dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
      const manager = new OpenAIServerManager()
      paraphrased = await manager.paraphraseTeamHealthComment(comment, question.question)
    }
  } catch (e) {
    logError(e instanceof Error ? e : new Error(`paraphraseTeamHealthResponse failed: ${e}`), {
      tags: {meetingId, questionId, op: 'paraphraseTeamHealthResponse'}
    })
  } finally {
    dataLoader.dispose()
  }
  // every exit path finalizes the row, or a comment the LLM choked on stays pending forever. A
  // failed paraphrase falls back to null: the comment is dropped from the results rather than
  // shown in the author's own words
  await getKysely()
    .updateTable('TeamHealthResponse')
    .set({commentParaphrased: paraphrased?.slice(0, MAX_PARAPHRASE_LENGTH) ?? null})
    .where('meetingId', '=', meetingId)
    .where('questionId', '=', questionId)
    .where('userId', '=', userId)
    // the author may have edited their comment while this job ran, which starts a fresh one. Only
    // the row this job was started for may be finalized
    .where('comment', '=', comment)
    .where('commentParaphrased', '=', PENDING_PARAPHRASE)
    .execute()
}

export default paraphraseTeamHealthResponse
