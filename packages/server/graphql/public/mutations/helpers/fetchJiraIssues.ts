import {generateText} from '@tiptap/core'
import convertADFToTipTap, {type AdfNode} from 'parabol-client/shared/tiptap/convertADFToTipTap'
import {serverTipTapExtensions} from '../../../../../client/shared/tiptap/serverTipTapExtensions'
import AtlassianServerManager from '../../../../utils/AtlassianServerManager'
import {Logger} from '../../../../utils/Logger'
import type {DataLoaderWorker} from '../../../graphql'
import {type InspirationIssue, MAX_ISSUES} from './issuesForAI'

// Flatten a Jira ADF description into plaintext for the AI prompt. getIssues types description as
// a string, but the search API returns it as an ADF document, so guard on the runtime shape.
const adfToPlaintext = (description: unknown) => {
  if (!description || typeof description !== 'object') return ''
  const tiptap = convertADFToTipTap(description as AdfNode)
  return generateText(tiptap, serverTipTapExtensions).trim()
}

// Re-runs the Jira search the user saw in the Your Work drawer, server-side, fetching the full
// description for each issue so the AI has enough context to draft a response. Returns the
// normalized issues, or [] if there's nothing to send.
const fetchJiraIssues = async (
  teamId: string,
  userId: string,
  searchQuery: string,
  dataLoader: DataLoaderWorker
): Promise<InspirationIssue[]> => {
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
  if (!auth) return []
  const cloudNameLookup = await dataLoader.get('atlassianCloudNameLookup').load({teamId, userId})
  const cloudIds = Object.keys(cloudNameLookup)
  if (cloudIds.length === 0) return []

  const manager = new AtlassianServerManager(auth.accessToken)
  const cloudResults = await Promise.all(
    cloudIds.map(async (cloudId): Promise<InspirationIssue[]> => {
      const {error, issues} = await manager.getIssues(cloudId, searchQuery, true, [], MAX_ISSUES)
      if (error) {
        Logger.error(error.message)
        return []
      }
      const cloudName = cloudNameLookup[cloudId]
      return issues.map((issue) => ({
        kind: 'Issue',
        title: issue.summary,
        reference: issue.issueKey,
        url: `https://${cloudName}.atlassian.net/browse/${issue.issueKey}`,
        updatedAt: new Date(issue.lastUpdated),
        description: adfToPlaintext(issue.description)
      }))
    })
  )

  return cloudResults.flat().slice(0, MAX_ISSUES)
}

export default fetchJiraIssues
