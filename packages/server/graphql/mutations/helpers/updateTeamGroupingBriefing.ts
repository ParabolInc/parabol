import ms from 'ms'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import buildGroupingBriefingPrompt from '../../../utils/groupReflections/buildGroupingBriefingPrompt'
import renderGroupingHistory, {
  type GroupingHistoryMeeting
} from '../../../utils/groupReflections/renderGroupingHistory'
import {Logger} from '../../../utils/Logger'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import type {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'

const HISTORY_WINDOW = ms('182d')
// About 225k tokens. Beyond it the oldest retrospectives are left out.
const MAX_HISTORY_CHARS = 900_000
const PARABOL_AI_USER_ID = 'parabolAIUser'

const loadMeetingHistory = async (
  meeting: {id: string; name: string; endedAt: Date},
  dataLoader: DataLoaderWorker
): Promise<GroupingHistoryMeeting> => {
  const {id: meetingId, name, endedAt} = meeting
  const [reflections, groups, discussions] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('discussionsByMeetingId').load(meetingId)
  ])
  const promptIds = [...new Set(reflections.map(({promptId}) => promptId))]
  const prompts = await dataLoader.get('templatePrompts').loadMany(promptIds)
  const questionById = new Map(
    prompts.flatMap((prompt) =>
      prompt && !(prompt instanceof Error) ? [[prompt.id, prompt.question]] : []
    )
  )
  const nameOf = async (userId: string | null | undefined) =>
    userId ? ((await dataLoader.get('users').load(userId))?.preferredName ?? null) : null

  const historyGroups = await Promise.all(
    groups.map(async ({id: groupId, title, voterIds}) => {
      const discussion = discussions.find(({discussionTopicId}) => discussionTopicId === groupId)
      const [comments, tasks] = discussion
        ? await Promise.all([
            dataLoader.get('commentsByDiscussionId').load(discussion.id),
            dataLoader.get('tasksByDiscussionId').load(discussion.id)
          ])
        : [[], []]
      const humanComments = comments
        .filter(
          ({isActive, createdBy, plaintextContent}) =>
            isActive && createdBy !== PARABOL_AI_USER_ID && plaintextContent.trim()
        )
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      return {
        title: title ?? '',
        votes: voterIds.length,
        cards: reflections
          .filter(({reflectionGroupId}) => reflectionGroupId === groupId)
          .filter(({plaintextContent}) => plaintextContent.trim())
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(({promptId, plaintextContent}) => ({
            prompt: questionById.get(promptId) ?? '',
            text: plaintextContent
          })),
        discussionSummary: discussion?.summary ?? null,
        comments: await Promise.all(
          humanComments.map(async ({createdBy, isAnonymous, plaintextContent}) => ({
            author: isAnonymous ? 'anonymous' : ((await nameOf(createdBy)) ?? 'someone'),
            text: plaintextContent
          }))
        ),
        tasks: await Promise.all(
          tasks
            .filter(({plaintextContent}) => plaintextContent.trim())
            .map(async ({userId, plaintextContent}) => ({
              owner: await nameOf(userId),
              text: plaintextContent
            }))
        )
      }
    })
  )
  return {name, endedAt, groups: historyGroups}
}

/**
 * Rewrites the briefing that suggested grouping reads, once one of the team's retros has ended, so
 * the next retro's suggestions know this team's people, systems and jargon.
 *
 * Fire-and-forget, and every failure is swallowed: a retro must end whether or not a briefing can be
 * written, and a failure leaves the previous briefing in place, which is older rather than wrong.
 */
const updateTeamGroupingBriefing = async (teamId: string) => {
  // The caller's dataLoader is disposed when its request ends, and this outlives that
  const dataLoader = getNewDataLoader('updateTeamGroupingBriefing')
  try {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    if (!(await canAccessAI(team, dataLoader))) return

    const pg = getKysely()
    const meetings = await pg
      .selectFrom('NewMeeting')
      .select(['id', 'name', 'endedAt'])
      .where('teamId', '=', teamId)
      .where('meetingType', '=', 'retrospective')
      .where('endedAt', '>=', new Date(Date.now() - HISTORY_WINDOW))
      .orderBy('endedAt')
      .execute()
    const ended = meetings.flatMap(({id, name, endedAt}) => (endedAt ? [{id, name, endedAt}] : []))
    const history = await Promise.all(
      ended.map((meeting) => loadMeetingHistory(meeting, dataLoader))
    )
    if (!history.some(({groups}) => groups.length)) return

    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const users = await dataLoader.get('users').loadMany(teamMembers.map(({userId}) => userId))
    const roster = users.flatMap((user) =>
      user && !(user instanceof Error) ? [user.preferredName] : []
    )

    const prompt = buildGroupingBriefingPrompt(
      roster,
      renderGroupingHistory(history, MAX_HISTORY_CHARS)
    )
    const briefing = await new OpenAIServerManager().generateGroupingBriefing(prompt)
    if (!briefing) return
    await pg
      .insertInto('TeamDetail')
      .values({id: teamId, groupingBriefing: briefing})
      .onConflict((oc) => oc.column('id').doUpdateSet({groupingBriefing: briefing}))
      .execute()
  } catch (e) {
    Logger.warn(`Unable to update the grouping briefing for team ${teamId}`, e)
  } finally {
    dataLoader.dispose()
  }
}

export default updateTeamGroupingBriefing
