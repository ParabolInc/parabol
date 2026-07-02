import {generateText} from '@tiptap/core'
import convertADFToTipTap, {type AdfNode} from 'parabol-client/shared/tiptap/convertADFToTipTap'
import {serverTipTapExtensions} from '../../../../../client/shared/tiptap/serverTipTapExtensions'
import AtlassianServerManager from '../../../../utils/AtlassianServerManager'
import {Logger} from '../../../../utils/Logger'
import type {DataLoaderWorker} from '../../../graphql'

const MAX_ITEMS = 20
const MAX_BODY_LEN = 1500

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text

// Flatten a Jira ADF description into plaintext for the AI prompt. getIssues types description as
// a string, but the search API returns it as an ADF document, so guard on the runtime shape.
const adfToPlaintext = (description: unknown) => {
  if (!description || typeof description !== 'object') return ''
  const tiptap = convertADFToTipTap(description as AdfNode)
  return generateText(tiptap, serverTipTapExtensions).trim()
}

// Re-runs the Jira search the user saw in the Your Work drawer, server-side, fetching the full
// description for each issue so the AI has enough context to draft a response. Returns a compact
// text blob suitable for an LLM prompt, or '' if there's nothing to send.
const fetchJiraWorkItems = async (
  teamId: string,
  userId: string,
  searchQuery: string,
  dataLoader: DataLoaderWorker
): Promise<string> => {
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
  if (!auth) return ''
  const cloudNameLookup = await dataLoader.get('atlassianCloudNameLookup').load({teamId, userId})
  const cloudIds = Object.keys(cloudNameLookup)
  if (cloudIds.length === 0) return ''

  const manager = new AtlassianServerManager(auth.accessToken)
  const cloudResults = await Promise.all(
    cloudIds.map(async (cloudId) => {
      const {error, issues} = await manager.getIssues(cloudId, searchQuery, true, [], MAX_ITEMS)
      if (error) {
        Logger.error(error.message)
        return []
      }
      return issues.map((issue) => {
        const cloudName = cloudNameLookup[cloudId]
        const url = `https://${cloudName}.atlassian.net/browse/${issue.issueKey}`
        const description = adfToPlaintext(issue.description)
        const body = description ? truncate(description, MAX_BODY_LEN) : '(no description)'
        return `### Issue: ${issue.summary} (${issue.issueKey})\n${url}\n${body}`
      })
    })
  )

  return cloudResults.flat().slice(0, MAX_ITEMS).join('\n\n')
}

export default fetchJiraWorkItems
