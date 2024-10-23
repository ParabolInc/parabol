import {DataLoaderInstance} from 'parabol-server/dataloader/RootDataLoader'
import prettier from 'prettier'
import {Comment} from '../../server/postgres/types'
import {inferLanguage} from '../inferLanguage'
import {ISO6391} from '../iso6393To1'

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
const MAX_TEXT_LENGTH = 10000
async function getPreferredNameByUserId(userId: string | null, dataLoader: DataLoaderInstance) {
  if (!userId) return 'Unknown'
  const user = await dataLoader.get('users').load(userId)
  return !user ? 'Unknown' : user.preferredName
}

async function formatThread(
  dataLoader: DataLoaderInstance,
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
      : await getPreferredNameByUserId(comment.createdBy, dataLoader)
    const how = depth === 0 ? 'wrote' : 'replied'
    const content = comment.plaintextContent?.slice(0, MAX_TEXT_LENGTH)
    if (!content) return ''
    const formattedPost = `${indent}- ${author} ${how}, "${content}"\n`

    // Recursively format child threads
    const childThread = await formatThread(dataLoader, comments, comment.id, depth + 1)
    return formattedPost + '\n' + childThread
  })

  // Resolve all promises and join the results
  const formattedComments = await Promise.all(formattedCommentsPromises)
  return formattedComments.join('')
}

export const createTextFromRetrospectiveDiscussionTopic = async (
  discussionId: string,
  dataLoader: DataLoaderInstance,
  textForReranking: boolean = false
) => {
  const discussion = await dataLoader.get('discussions').load(discussionId)
  if (!discussion) throw new Error(`Discussion not found: ${discussionId}`)
  const {discussionTopicId: reflectionGroupId, meetingId, summary: discussionSummary} = discussion
  const [newMeeting, reflectionGroup, reflections] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('retroReflectionGroups').load(reflectionGroupId),
    dataLoader.get('retroReflectionsByGroupId').load(reflectionGroupId)
  ])
  if (newMeeting.meetingType !== 'retrospective') throw new Error('Meeting is not a retro')
  // It should never be undefined now that data is in PG. Can try removing & testing
  const templateId = newMeeting?.templateId ?? ''

  const promptIds = [...new Set(reflections.map((r) => r.promptId))]
  const [template, ...prompts] = await Promise.all([
    dataLoader.get('meetingTemplates').load(templateId),
    ...promptIds.map((promptId) => dataLoader.get('reflectPrompts').load(promptId))
  ])

  let markdown = ''
  const templateName = template?.name ?? 'Unknown'
  if (!textForReranking) {
    markdown =
      `A topic "${reflectionGroup?.title ?? ''}" was discussed during ` +
      `the meeting "${newMeeting.name}" that followed the "${templateName}" template.\n` +
      `\n`
  }

  for (const prompt of prompts) {
    if (!prompt) continue // Should never happen now that data is in PG
    if (!textForReranking) {
      markdown += `Participants were prompted with, "${prompt.question}`
      if (prompt.description) markdown += `: ${prompt.description}`
      markdown += `".\n`
    }
    const matchingReflections = reflections.filter((r) => r.promptId === prompt.id)
    for (const reflection of matchingReflections) {
      const content = reflection.plaintextContent?.slice(0, MAX_TEXT_LENGTH)
      if (!content) continue
      const author = newMeeting.disableAnonymity
        ? await getPreferredNameByUserId(reflection.creatorId, dataLoader)
        : 'Anonymous'
      markdown += `   - ${author} wrote, "${content}"\n`
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

  let language: ISO6391 | undefined = undefined
  if (discussionSummary) {
    markdown += `Further discussion was made. ` + ` ${discussionSummary}`
  } else {
    const comments = await dataLoader.get('commentsByDiscussionId').load(discussionId)

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
        if (!a.threadParentId) return 1
        if (!b.threadParentId) return -1
        return a.threadParentId > b.threadParentId ? 1 : -1
      }) as Comment[]

    const filteredComments = sortedComments.filter(
      (c) => !IGNORE_COMMENT_USER_IDS.includes(c.createdBy!)
    )
    if (filteredComments.length) {
      markdown += `Further discussion was made:\n`
      markdown += await formatThread(dataLoader, filteredComments)
      const commentBlob = filteredComments.map((c) => c.plaintextContent).join(' ')
      // it's common to reflect in english and comment in a native tongue
      language = inferLanguage(commentBlob)
    }
  }

  const body = await prettier.format(markdown, {
    parser: 'markdown',
    proseWrap: 'always',
    printWidth: 72
  })

  language = language || inferLanguage(reflections.map((r) => r.plaintextContent).join(' '))
  return {body, language}
}
