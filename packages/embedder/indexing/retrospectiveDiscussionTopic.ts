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

import {upsertEmbeddingsMetaRows} from './embeddingsTablesOps'
import {AnyMeeting} from 'parabol-server/postgres/types/Meeting'

const BATCH_SIZE = 1000

export interface EmbeddingsJobQueueRetrospectiveDiscussionTopic
  extends Omit<DB['EmbeddingsJobQueue'], 'objectType'> {
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

export async function refreshRetroDiscussionTopicsMeta(dataLoader: DataLoaderWorker) {
  const r = await getRethink()
  const {createdAt: newestMeetingDate} = (await r
    .table('NewMeeting')
    .max({index: 'createdAt'})
    .run()) as unknown as RethinkSchema['NewMeeting']['type']
  const {createdAt: oldestMeetingDate} = (await r
    .table('NewMeeting')
    .min({index: 'createdAt'})
    .run()) as unknown as RethinkSchema['NewMeeting']['type']

  const {newestMetaDate} = (await pg
    .selectFrom('EmbeddingsMetadata')
    .select(pg.fn.max('refUpdatedAt').as('newestMetaDate'))
    .where('objectType', '=', 'retrospectiveDiscussionTopic')
    .executeTakeFirst()) ?? {newestMetaDate: null}
  let startDateTime = newestMetaDate || oldestMeetingDate

  if (startDateTime.getTime() === newestMeetingDate.getTime()) return

  console.log(
    `refreshRetroDiscussionTopicsMeta(): ` +
      `will consider adding items from ${startDateTime.toISOString()} to ` +
      `${newestMeetingDate.toISOString()}`
  )

  let totalAdded = 0
  do {
    // Process history in batches.
    //
    // N.B. We add historical meetings to the EmbeddingsMetadata table here.
    // This query will intentionally miss meetings that haven't been completed
    // (`summarySentAt` is null). These meetings will need to be added to the
    // EmbeddingsMetadata table by a hook that runs when the meetings complete.
    const {maxCreatedAt, completedNewMeetings} = await r
      .table('NewMeeting')
      .between(startDateTime, newestMeetingDate, {rightBound: 'closed', index: 'createdAt'})
      .orderBy({index: 'createdAt'})
      .limit(BATCH_SIZE)
      .coerceTo('array')
      .do((rows: any) => ({
        maxCreatedAt: r.expr(rows).max('createdAt')('createdAt'), // Then find the max createdAt value
        completedNewMeetings: r.expr(rows).filter((r: any) =>
          r('meetingType')
            .eq('retrospective')
            .and(
              r('endedAt').gt(0),
              r
                .hasFields('phases')
                .and(r('phases').count().gt(0))
                .and(
                  r('phases')
                    .filter((phase: any) => phase('phaseType').eq('discuss'))
                    .filter((phase: any) =>
                      phase.hasFields('stages').and(phase('stages').count().gt(0))
                    )
                    .count()
                    .gt(0)
                )
            )
        )
      }))
      .run()
    const embeddingsMetaRows = (
      await Promise.all(
        completedNewMeetings.map((m: AnyMeeting) =>
          newRetroDiscussionTopicsFromNewMeeting(m, dataLoader)
        )
      )
    ).flat()
    if (embeddingsMetaRows.length > 0) {
      await upsertEmbeddingsMetaRows(embeddingsMetaRows)
      totalAdded += embeddingsMetaRows.length
      console.log(
        `refreshRetroDiscussionTopicsMeta(): synced to ${maxCreatedAt.toISOString()}, added` +
          ` ${embeddingsMetaRows.length} retrospectiveDiscussionTopics`
      )
    }

    // N.B. In the unlikely event that we have >=BATCH_SIZE meetings that end at _exactly_
    // the same timetsamp, this will loop forever.
    if (
      startDateTime.getTime() === newestMeetingDate.getTime() &&
      completedNewMeetings.length < BATCH_SIZE
    )
      break
    startDateTime = maxCreatedAt
  } while (true)

  console.log(
    `refreshRetroDiscussionTopicsMeta(): added ${totalAdded} total retrospectiveDiscussionTopics`
  )
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
    .sort((a, b) => (a.threadSortOrder < b.threadSortOrder ? -1 : 1))

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

export const createTextFromNewMeetingDiscussionStage = async (
  newMeeting: MeetingRetrospective,
  stageId: string,
  dataLoader: DataLoaderWorker,
  textForReranking: boolean = false
) => {
  if (!newMeeting) throw 'newMeeting is undefined'
  if (!isMeetingRetrospective(newMeeting)) throw 'newMeeting is not retrospective'
  if (!newMeeting.templateId) throw 'template is undefined'
  const template = await dataLoader.get('meetingTemplates').load(newMeeting.templateId)
  if (!template) throw 'template is undefined'
  const discussPhase = newMeeting.phases.find((phase) => phase.phaseType === 'discuss')
  if (!discussPhase) throw 'newMeeting discuss phase is undefined'
  if (!discussPhase.stages) throw 'newMeeting discuss phase has no stages'
  const discussStage = discussPhase.stages.find((stage) => stage.id === stageId) as DiscussStage
  if (!discussStage) throw 'newMeeting discuss stage not found'
  const {summary: discussionSummary} = discussStage.discussionId
    ? (await dataLoader.get('discussions').load(discussStage.discussionId)) ?? {summary: null}
    : {summary: null}
  const r = await getRethink()
  if (!discussStage.reflectionGroupId) throw 'newMeeting discuss stage has no reflectionGroupId'
  const reflectionGroup = await r
    .table('RetroReflectionGroup')
    .get(discussStage.reflectionGroupId)
    .run()
  if (!reflectionGroup.id) throw 'newMeeting reflectionGroup has no id'
  const reflections = await r
    .table('RetroReflection')
    .getAll(reflectionGroup.id, {index: 'reflectionGroupId'})
    .run()
  const promptIds = [...new Set(reflections.map((r) => r.promptId))]
  let markdown = ''
  if (!textForReranking)
    markdown =
      `A topic "${reflectionGroup.title}" was discussed during ` +
      `the meeting "${newMeeting.name}" that followed the "${template.name}" template.\n` +
      `\n`
  const prompts = await dataLoader.get('reflectPrompts').loadMany(promptIds)
  for (const prompt of prompts) {
    if (!prompt || prompt instanceof Error) continue
    if (!textForReranking) {
      markdown += `Participants were prompted with, "${prompt.question}`
      if (prompt.description) markdown += `: ${prompt.description}`
      markdown += `".\n`
    }
    if (newMeeting.disableAnonymity) {
      for (const reflection of reflections.filter((r) => r.promptId === prompt.id)) {
        const author = await getPreferredNameByUserId(reflection.creatorId, dataLoader)
        markdown += `   - ${author} wrote, "${reflection.plaintextContent}"\n`
      }
    } else {
      for (const reflection of reflections.filter((r) => r.promptId === prompt.id)) {
        markdown += `   - Anonymous wrote, "${reflection.plaintextContent}"\n`
      }
    }
    markdown += `\n`
  }

  markdown += `\n`

  /**
   * The choice I made here was default to the summary of the discussion if it exists in order to make this textual
   * representation of a retrospective discussion a shorter token count. Using the summary almost certainly ensures
   * this text won't need to be sent to be summarized again before an embedding vector is calculated.
   *
   * If we included the comments all the time, then we're maximizing the chance that rarer tokens might end up in the
   * embed text and these tokens might affect the final embed vector in a useful way. However, we increase the odds that
   * the embed text will need to be summarized before the vector is calculated.
   *
   * I decided to "just be cheap" and try and minimize calls to the summarizer.
   *
   * If we wanted to compare and contrast these approaches, we could always generate a second set of embed vectors
   * objectType: 'retrospectiveDiscussionNoSummary' or something and do a bit of testing.
   */

  if (discussionSummary) {
    markdown += `Further discussion was made. ` + ` ${discussionSummary}`
  } else {
    const comments = await dataLoader.get('commentsByDiscussionId').load(stageId)

    const sortedComments = comments
      .map((comment) => {
        if (!comment.threadParentId) {
          return {
            ...comment,
            threadParentId: null
          }
        }
        return comment
      })
      .sort((a, b) => {
        if (a.threadParentId === b.threadParentId) {
          return a.threadSortOrder - b.threadSortOrder
        }
        if (a.threadParentId == null) return 1
        if (b.threadParentId == null) return -1
        return a.threadParentId > b.threadParentId ? 1 : -1
      }) as Comment[]

    const filteredComments = sortedComments.filter(
      (c) => !IGNORE_COMMENT_USER_IDS.includes(c.createdBy)
    )
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
  item: Selectable<EmbeddingsJobQueueRetrospectiveDiscussionTopic>,
  dataLoader: DataLoaderWorker
): Promise<string> => {
  if (!item.refId) throw 'refId is undefined'
  const [newMeetingId, discussionId] = item.refId.split(':')
  if (!newMeetingId) throw new Error('newMeetingId cannot be undefined')
  if (!discussionId) throw new Error('discussionId cannot be undefined')
  const newMeeting = await dataLoader.get('newMeetings').load(newMeetingId)
  return createTextFromNewMeetingDiscussionStage(
    newMeeting as MeetingRetrospective,
    discussionId,
    dataLoader
  )
}

export const newRetroDiscussionTopicsFromNewMeeting = async (
  newMeeting: RethinkSchema['NewMeeting']['type'],
  dataLoader: DataLoaderWorker
) => {
  const discussPhase = newMeeting.phases.find((phase) => phase.phaseType === 'discuss')
  const orgId = (await dataLoader.get('teams').load(newMeeting.teamId))?.orgId
  if (orgId && discussPhase && discussPhase.stages) {
    return discussPhase.stages.map((stage) => ({
      objectType: 'retrospectiveDiscussionTopic' as const,
      teamId: newMeeting.teamId,
      refId: `${newMeeting.id}:${stage.id}`,
      refUpdatedAt: newMeeting.createdAt
    }))
  } else {
    return []
  }
}
