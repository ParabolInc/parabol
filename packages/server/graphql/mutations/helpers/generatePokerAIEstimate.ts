import {generateText, type JSONContent} from '@tiptap/core'
import JiraProjectKeyId from 'parabol-client/shared/gqlIds/JiraProjectKeyId'
import convertADFToTipTap, {type AdfNode} from 'parabol-client/shared/tiptap/convertADFToTipTap'
import {markdownToTipTap} from 'parabol-client/shared/tiptap/markdownToTipTap'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {PARABOL_AI_USER_ID} from 'parabol-client/utils/constants'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import type {EstimateStage} from '../../../postgres/types/NewMeetingPhase'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import {createAIComment} from './addAIGeneratedContentToThreads'

const MAX_REFERENCE_ISSUES = 10

// Flatten a Jira ADF description into plaintext for the AI prompt
const adfToPlaintext = (description: AdfNode | null | undefined) => {
  if (!description) return ''
  const tiptap = convertADFToTipTap(description)
  return generateText(tiptap, serverTipTapExtensions).trim()
}

// Build a stringified TipTap doc (issue title as the first node + description) for the hover popover
const buildPopoverContent = (description: AdfNode | null | undefined, title: string) => {
  const adf = description ?? {type: 'doc', content: []}
  return JSON.stringify(convertADFToTipTap(adf, title))
}

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
  const body = markdownToTipTap(markdown) as JSONContent[]
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

interface Options {
  stage: EstimateStage
  meetingId: string
  teamId: string
}

// Generates an AI story-point estimate for a Jira Cloud issue and posts it as a
// comment in the stage discussion. Called once votes are revealed, so the result
// is published async via the meeting pubsub channel as soon as it is ready.
export const generatePokerAIEstimate = async (options: Options) => {
  const {stage, meetingId, teamId} = options
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
    // only Jira Cloud issues are supported
    if (!integration || integration.service !== 'jira') return
    const {cloudId, issueKey, accessUserId} = integration
    const projectKey = JiraProjectKeyId.join(issueKey)

    // resolve the dimension + scale (possible story point values)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting || meeting.meetingType !== 'poker') return
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(meeting.templateRefId)
    const dimensionRef = templateRef.dimensions[dimensionRefIdx]
    if (!dimensionRef) return
    const {name: dimensionName, scaleRefId} = dimensionRef
    const scaleRef = await dataLoader.get('templateScaleRefs').loadNonNull(scaleRefId)
    const possibleLabels = scaleRef.values.map(({label}) => label)

    const jiraIssue = await dataLoader.get('jiraIssue').load({
      teamId,
      userId: accessUserId,
      cloudId,
      issueKey,
      taskId,
      viewerId: accessUserId
    })
    if (!jiraIssue) return
    const {issueType, summary, description} = jiraIssue

    // figure out which Jira field holds the story points for this dimension
    const dimensionFields = await dataLoader
      .get('jiraDimensionFieldMap')
      .load({teamId, cloudId, projectKey, issueType, dimensionName})
    const fieldId = dimensionFields.find(
      ({fieldId}) =>
        fieldId !== SprintPokerDefaults.SERVICE_FIELD_COMMENT &&
        fieldId !== SprintPokerDefaults.SERVICE_FIELD_NULL
    )?.fieldId
    // no real story-point field mapped (e.g. team writes estimate as a comment) -> nothing to reference
    if (!fieldId) return

    // fetch recent issues from the same project that already have an estimate
    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: accessUserId})
    if (!auth) return
    const manager = new AtlassianServerManager(auth.accessToken)
    // over-fetch since issues without an estimate are filtered out below
    const {issues: recentIssues} = await manager.getProjectIssuesWithField(
      cloudId,
      projectKey,
      fieldId,
      50
    )

    const references = (recentIssues ?? [])
      .filter((issue) => issue.issueKey !== issueKey)
      .slice(0, MAX_REFERENCE_ISSUES)
      .map((issue) => ({
        issueKey: issue.issueKey,
        title: issue.summary,
        description: adfToPlaintext(issue.description),
        storyPoints: issue.storyPoints,
        content: buildPopoverContent(issue.description, issue.summary)
      }))

    // the popover content doc is for the comment, not the prompt, so keep it out of the AI input
    const issues = [
      {issueKey, title: summary, description: adfToPlaintext(description), storyPoints: ''},
      ...references.map(({content, ...rest}) => rest)
    ]

    const openAI = new OpenAIServerManager()
    const estimate = await openAI.getPokerEstimate(issues, dimensionName, possibleLabels)
    if (!estimate) return

    // map every referenced issue key to its content doc for the comment's hover popovers
    const contentByKey: Record<string, string> = {
      [issueKey]: buildPopoverContent(description, summary)
    }
    for (const reference of references) {
      contentByKey[reference.issueKey] = reference.content
    }

    const content = buildEstimateCommentDoc(estimate, contentByKey)
    const comment = createAIComment(discussionId, content, 1)
    await getKysely().insertInto('Comment').values(comment).execute()

    const data = {commentId: comment.id, meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', data, subOptions)
  } finally {
    dataLoader.dispose()
  }
}
