import type {JSONContent} from '@tiptap/core'
import type {GraphQLResolveInfo} from 'graphql'
import {markdownToTipTap} from 'parabol-client/shared/tiptap/markdownToTipTap'
import {replaceCalloutsWithBlockquotes} from 'parabol-client/shared/tiptap/replaceCalloutsWithBlockquotes'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {PARABOL_AI_USER_ID} from 'parabol-client/utils/constants'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import type {EstimateStage} from '../../../postgres/types/NewMeetingPhase'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import rankByTextSimilarity from '../../../utils/rankByTextSimilarity'
import type {GQLContext} from '../../graphql'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {createAIComment} from './addAIGeneratedContentToThreads'
import getJiraEstimateCandidates from './getJiraEstimateCandidates'
import getPokerStory from './getPokerStory'
import getTeamEstimateHistory from './getTeamEstimateHistory'

const MAX_REFERENCE_ISSUES = 10

// Build a stringified TipTap doc (issue title as the first node + description) for the hover popover
const buildStoryPopoverContent = (title: string, description: string) =>
  JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: {level: 1},
        content: title ? [{type: 'text', text: title}] : []
      },
      ...(description ? replaceCalloutsWithBlockquotes(markdownToTipTap(description)) : [])
    ]
  })

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Walk the markdown-derived TipTap tree and replace bare issue-key text (e.g. "PROJ-123")
// with popoverMention nodes that carry the issue's content doc for the hover popover.
const injectIssueKeyMentions = (
  nodes: JSONContent[],
  regex: RegExp,
  contentByKey: Record<string, string>
): JSONContent[] =>
  nodes.flatMap((node) => {
    if (node.type === 'text' && typeof node.text === 'string') {
      const {text} = node
      const parts: JSONContent[] = []
      let lastIndex = 0
      regex.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = regex.exec(text))) {
        const issueKey = match[1]!
        if (match.index > lastIndex) parts.push({...node, text: text.slice(lastIndex, match.index)})
        parts.push({
          type: 'popoverMention',
          attrs: {label: issueKey, content: contentByKey[issueKey] ?? ''}
        })
        lastIndex = match.index + issueKey.length
      }
      if (parts.length === 0) return [node]
      if (lastIndex < text.length) parts.push({...node, text: text.slice(lastIndex)})
      return parts
    }
    if (Array.isArray(node.content)) {
      return [{...node, content: injectIssueKeyMentions(node.content, regex, contentByKey)}]
    }
    return [node]
  })

// Convert the AI markdown response into a TipTap comment doc, linking issue keys to popovers
const buildEstimateCommentDoc = (
  markdown: string,
  contentByKey: Record<string, string>
): JSONContent => {
  const body = replaceCalloutsWithBlockquotes(markdownToTipTap(markdown))
  const content = body.length
    ? body
    : [{type: 'paragraph', content: [{type: 'text', text: markdown}]}]
  const keys = Object.keys(contentByKey)
  if (keys.length === 0) return {type: 'doc', content}
  // longest keys first so e.g. PROJ-12 can't shadow PROJ-123, and guard against partial matches
  const pattern = keys
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|')
  const regex = new RegExp(`(?<![\\w-])(${pattern})(?![\\w-])`, 'g')
  return {type: 'doc', content: injectIssueKeyMentions(content, regex, contentByKey)}
}

interface Candidate {
  issueKey: string
  title: string
  description: string
  storyPoints: string
  content?: string
}

interface Options {
  stage: EstimateStage
  meetingId: string
  teamId: string
  context: GQLContext
  info: GraphQLResolveInfo
}

// Generates an AI estimate for an integrated issue and posts it as a comment in the stage
// discussion. Called once votes are revealed, so the result is published async via the
// meeting pubsub channel as soon as it is ready.
export const generatePokerAIEstimate = async (options: Options) => {
  const {stage, meetingId, teamId, context, info} = options
  const dataLoader = getNewDataLoader('generatePokerAIEstimate')
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const {taskId, dimensionRefIdx, discussionId} = stage

  try {
    // bail if an AI estimate was already posted for this discussion (e.g. votes were
    // revealed again after the stage was reset) so we never post a duplicate
    const existingComments = await dataLoader.get('commentsByDiscussionId').load(discussionId)
    if (existingComments.some((comment) => comment.createdBy === PARABOL_AI_USER_ID)) return

    const task = await dataLoader.get('tasks').load(taskId)
    const integration = task?.integration
    if (!task || !integration) return

    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting || meeting.meetingType !== 'poker') return
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(meeting.templateRefId)
    const dimensionRef = templateRef.dimensions[dimensionRefIdx]
    if (!dimensionRef) return
    const {name: dimensionName, scaleRefId} = dimensionRef
    const scaleRef = await dataLoader.get('templateScaleRefs').loadNonNull(scaleRefId)
    const possibleLabels = scaleRef.values.map(({label}) => label)

    const {accessUserId} = integration
    const story = await getPokerStory({
      dataLoader,
      teamId,
      userId: accessUserId,
      context,
      info,
      task,
      viewerId: accessUserId
    })
    if (!story) return

    const {pastVotes, stories} = await getTeamEstimateHistory({
      teamId,
      dimensionName,
      labels: possibleLabels,
      repoId: story.repoId,
      excludeTaskId: taskId
    })
    const seenReferences = new Set([story.reference])
    const storedCandidates = stories.flatMap(
      ({label, storyReference, storyTitle, storyDescription}) => {
        if (seenReferences.has(storyReference)) return []
        seenReferences.add(storyReference)
        return [
          {
            issueKey: storyReference,
            title: storyTitle,
            description: storyDescription,
            storyPoints: label
          }
        ]
      }
    )
    // a Jira team's first estimates in Parabol still learn from the project's own estimated issues
    const jiraCandidates =
      storedCandidates.length === 0 && integration.service === 'jira'
        ? await getJiraEstimateCandidates({
            dataLoader,
            teamId,
            integration,
            repoId: story.repoId,
            dimensionName
          })
        : []
    const candidates: Candidate[] = jiraCandidates.length > 0 ? jiraCandidates : storedCandidates
    const pastEstimates =
      jiraCandidates.length > 0 ? jiraCandidates.map(({storyPoints}) => storyPoints) : pastVotes

    const target = {
      issueKey: story.reference,
      title: story.title,
      description: story.description,
      storyPoints: ''
    }
    const issueText = ({title, description}: {title: string; description: string}) =>
      `${title}\n${description}`
    const references = rankByTextSimilarity(issueText(target), candidates, issueText).slice(
      0,
      MAX_REFERENCE_ISSUES
    )

    // the popover content doc is for the comment, not the prompt, so keep it out of the AI input
    const issues = [target, ...references.map(({content, ...rest}) => rest)]

    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const organization = await dataLoader.get('organizations').loadNonNull(team.orgId)
    const openAI = new OpenAIServerManager()
    const estimate = await openAI.getPokerEstimate(
      issues,
      dimensionName,
      possibleLabels,
      pastEstimates,
      getFeatureTier(organization) === 'starter' ? 'low' : 'medium'
    )
    if (!estimate) return

    // map every referenced issue key to its content doc for the comment's hover popovers
    const contentByKey: Record<string, string> = {
      [story.reference]: buildStoryPopoverContent(story.title, story.description)
    }
    for (const reference of references) {
      contentByKey[reference.issueKey] =
        reference.content ?? buildStoryPopoverContent(reference.title, reference.description)
    }

    const content = buildEstimateCommentDoc(estimate, contentByKey)
    const comment = createAIComment(discussionId, content, 1)
    await getKysely().insertInto('Comment').values(comment).execute()

    const data = {commentId: comment.id, meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentPayload', data, subOptions)
  } finally {
    dataLoader.dispose()
  }
}
