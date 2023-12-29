import {Selectable} from 'kysely'
import prettier from 'prettier'

import getRethink, {RethinkSchema} from 'parabol-server/database/rethinkDriver'
import {DataLoaderWorker} from 'parabol-server/graphql/graphql'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'

import Comment from 'parabol-server/database/types/Comment'
import DiscussStage from 'parabol-server/database/types/DiscussStage'
import MeetingRetrospective, {
  isMeetingRetrospective
} from 'parabol-server/database/types/MeetingRetrospective'
import {RDatum} from 'parabol-server/database/stricterR'

import generateHourIntervals from './generateHourIntervals'
import {DBInsert} from '../embedder'

export interface EmbeddingsIndexRetrospectiveDiscussionTopic
  extends Omit<DB['EmbeddingsIndex'], 'objectType'> {
  objectType: 'retrospectiveDiscussionTopic'
}

// Here's a generic reprentation of the text generated here:

// A topic "<DISCUSSION_TOPIC>" was discussed during the meeting "<MEETING_NAME>"
// that followed the "<TEMPLATE_NAME>" template.
//
// <FOR EACH PROMPT>
// Participants were prompted with, "<PROMPT>: <PROMPT DESCRIPTION>".
//  - <PARTICIPANT|ANONYMOUS> wrote, "<RESPONSE>"
//
// </FOR EACH PROMPT>
//
// <IF DISCUSSION>
// A discussion was held. <DISCUSSION SUMMARY>
// </END IF DISCUSSION>

const IGNORE_COMMENT_USER_IDS = ['parabolAIUser']

const pg = getKysely()

export async function refreshEmbeddingsIndex(dataLoader: DataLoaderWorker) {
  const r = await getRethink()
  const {createdAt: newestMeetingDate} = (await r
    .table('NewMeeting')
    .max({index: 'createdAt'})
    .run()) as unknown as RethinkSchema['NewMeeting']['type']
  const {createdAt: oldestMeetingDate} = (await r
    .table('NewMeeting')
    .min({index: 'createdAt'})
    .run()) as unknown as RethinkSchema['NewMeeting']['type']

  const {newestIndexDate} = (await pg
    .selectFrom('EmbeddingsIndex')
    .select(pg.fn.max('refDateTime').as('newestIndexDate'))
    .executeTakeFirst()) ?? {newestIndexDate: null}
  const startDateTime = newestIndexDate || oldestMeetingDate
  console.log(`Index will consider adding items from ${startDateTime} to ${newestMeetingDate}`)

  if (startDateTime.getTime() === newestMeetingDate.getTime()) return

  for (const interval of generateHourIntervals(startDateTime, newestMeetingDate)) {
    // fetch completed meetings within the time range, ensuring these meetings
    // contain at least 1 discuss phase
    const meetings = await r
      .table('NewMeeting')
      .between(interval[0], interval[1], {rightBound: 'closed', index: 'createdAt'})
      .filter((r: RDatum) =>
        r('meetingType')
          .eq('retrospective')
          .and(
            r('summarySentAt').gt(0),
            r
              .hasFields('phases')
              .and(r('phases').count().gt(0))
              .and(
                r('phases')
                  .filter((phase: RDatum) => phase('phaseType').eq('discuss'))
                  .filter((phase: RDatum) =>
                    phase.hasFields('stages').and(phase('stages').count().gt(0))
                  )
                  .count()
                  .gt(0)
              )
          )
      )
      .run()
    const embeddingsIndexRows = (
      await Promise.all(meetings.map((m) => newRetroDiscussionTopicFromNewMeeting(m, dataLoader)))
    )
      .flat()
      .filter((row) => row.orgId !== null)
    if (embeddingsIndexRows.length < 1) continue

    await pg
      .insertInto('EmbeddingsIndex')
      .values(embeddingsIndexRows)
      .onConflict((oc) =>
        oc.columns(['objectType', 'refTable', 'refId']).doUpdateSet((eb) => ({
          objectType: eb.ref('excluded.objectType'),
          refTable: eb.ref('excluded.refTable'),
          refId: eb.ref('excluded.refId'),
          refDateTime: eb.ref('excluded.refDateTime')
          // state: eb.ref('excluded.state'),          // preserve the prior values
          // teamId: eb.ref('excluded.teamId'),
          // orgId: eb.ref('excluded.orgId'),
          // embedText: eb.ref('excluded.embedText')
        }))
      )
      .execute()
  }
}

async function getPreferredNameByUserId(userId: string, dataLoader: DataLoaderWorker) {
  const user = await dataLoader.get('users').load(userId)
  return !user ? 'Unknown' : user.preferredName
}

async function formatThread(
  dataLoader: DataLoaderWorker,
  comments: Comment[],
  parentId: string | null = null,
  depth = 0
): Promise<string> {
  // Filter and sort comments as before
  const filteredComments = comments
    .filter((comment) => comment.threadParentId === parentId)
    .sort((a, b) => a.threadSortOrder - b.threadSortOrder)

  // Use map to create an array of promises for each formatted comment string
  const formattedCommentsPromises = filteredComments.map(async (comment) => {
    const indent = '   '.repeat(depth + 1)
    const author = comment.isAnonymous
      ? 'Anonymous'
      : comment.createdBy
      ? await getPreferredNameByUserId(comment.createdBy, dataLoader)
      : 'Unknown'
    const how = depth === 0 ? 'wrote' : 'replied'
    const content = comment.plaintextContent
    const formattedPost = `${indent}- ${author} ${how}, "${content}"\n`

    // Recursively format child threads
    const childThread = await formatThread(dataLoader, comments, comment.id, depth + 1)
    return formattedPost + '\n' + childThread
  })

  // Resolve all promises and join the results
  const formattedComments = await Promise.all(formattedCommentsPromises)
  return formattedComments.join('')
}

export const createTextFromNewMeetingDiscussion = async (
  newMeeting: MeetingRetrospective,
  discussionId: string,
  dataLoader: DataLoaderWorker
) => {
  if (!newMeeting) throw 'newMeeting is undefined'
  if (!isMeetingRetrospective(newMeeting)) throw 'newMeeting is not retrospective'
  const template = await dataLoader.get('meetingTemplates').load(newMeeting.templateId)
  if (!template) throw 'template is undefined'
  const discussPhase = newMeeting.phases.find((phase) => phase.phaseType === 'discuss')
  if (!discussPhase) throw 'newMeeting discuss phase is undefined'
  if (!discussPhase.stages) throw 'newMeeting discuss phase has no stages'
  const discussStage = discussPhase.stages.find(
    (stage) => stage.id === discussionId
  ) as DiscussStage
  if (!discussStage) throw 'newMeeting discuss stage not found'
  const {summary: discussionSummary} = (await pg
    .selectFrom('Discussion')
    .select('summary')
    .where('id', '=', discussStage.discussionId)
    .executeTakeFirst()) ?? {summary: null}
  const r = await getRethink()
  const reflectionGroup = await r
    .table('RetroReflectionGroup')
    .get(discussStage.reflectionGroupId)
    .run()
  const reflections = await r
    .table('RetroReflection')
    .getAll(reflectionGroup.id, {index: 'reflectionGroupId'})
    .run()
  const promptIds = [...new Set(reflections.map((r) => r.promptId!))]
  let markdown =
    `A topic "${reflectionGroup.title}" was discussed during ` +
    `the meeting "${newMeeting.name}" that followed the "${template.name}" template.\n` +
    `\n`
  for (const promptId of promptIds) {
    const prompt = await dataLoader.get('reflectPrompts').load(promptId)
    markdown += `Participants were prompted with, "${prompt!.question}`
    if (prompt!.description) markdown += `: ${prompt!.description}`
    markdown += `".\n`
    if (newMeeting.disableAnonymity) {
      for (const reflection of reflections.filter((r) => r.promptId === promptId)) {
        const author = await getPreferredNameByUserId(reflection.creatorId, dataLoader)
        markdown += `   - ${author} wrote, "${reflection.plaintextContent}"\n`
      }
    } else {
      for (const reflection of reflections.filter((r) => r.promptId === promptId)) {
        markdown += `   - Anonymous wrote, "${reflection.plaintextContent}"\n`
      }
    }
    markdown += `\n`
  }
  markdown += `\n`

  if (discussionSummary) {
    markdown += `Further discussion was made. ` + ` ${discussionSummary}`
  } else {
    const comments = await r
      .table('Comment')
      .getAll(discussStage.discussionId, {index: 'discussionId'})
      .orderBy(r.asc('threadParentId'), r.asc('threadSortOrder'))
      .map((doc) => doc.hasFields('threadParentId').branch(doc, doc.merge({threadParentId: null})))
      .run()
    const filteredComments = comments.filter((c) => !IGNORE_COMMENT_USER_IDS.includes(c.createdBy))
    if (filteredComments.length) {
      markdown += `Futher discussion was made:\n`
      markdown += await formatThread(dataLoader, filteredComments)
      // TODO: if the discussion threads are too long, summarize them
    }
  }

  markdown = prettier.format(markdown, {
    parser: 'markdown',
    proseWrap: 'always',
    printWidth: 72
  })

  return markdown
}

export const createText = async (
  item: Selectable<EmbeddingsIndexRetrospectiveDiscussionTopic>,
  dataLoader: DataLoaderWorker
): Promise<string> => {
  if (!item.refId) throw 'refId is undefined'
  const [newMeetingId, discussionId] = item.refId.split(':')
  if (!newMeetingId) throw new Error('newMeetingId cannot be undefined')
  if (!discussionId) throw new Error('discussionId cannot be undefined')
  const newMeeting = await dataLoader.get('newMeetings').load(newMeetingId)
  return createTextFromNewMeetingDiscussion(
    newMeeting as MeetingRetrospective,
    discussionId,
    dataLoader
  )
}

export const newRetroDiscussionTopicFromNewMeeting = async (
  newMeeting: RethinkSchema['NewMeeting']['type'],
  dataLoader: DataLoaderWorker
): Promise<DBInsert['EmbeddingsIndex'][]> => {
  const discussPhase = newMeeting.phases.find((phase) => phase.phaseType === 'discuss')
  const orgId = (await dataLoader.get('teams').load(newMeeting.teamId))?.orgId
  if (orgId && discussPhase && discussPhase.stages) {
    const indexRows = discussPhase.stages.map(async (stage) => ({
      objectType: 'retrospectiveDiscussionTopic' as 'retrospectiveDiscussionTopic',
      state: 'new' as 'new',
      teamId: newMeeting.teamId,
      orgId: orgId,
      refTable: 'NewMeeting',
      refId: `${newMeeting.id}:${stage.id}`,
      refDateTime: newMeeting.createdAt
    }))
    return Promise.all(indexRows)
  } else {
    return []
  }
}
