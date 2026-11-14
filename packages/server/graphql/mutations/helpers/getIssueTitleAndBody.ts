import type {JSONContent} from '@tiptap/core'
import {splitTipTapContent} from 'parabol-client/shared/tiptap/splitTipTapContent'
import {tipTapToMarkdown} from 'parabol-client/shared/tiptap/tipTapToMarkdown'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import type {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'

const MAX_ISSUE_TITLE_LENGTH = 255

const getIssueTitleAndBody = async (
  rawContent: JSONContent,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const {title, bodyContent, isTitleExcerpt} = splitTipTapContent(
    rawContent,
    MAX_ISSUE_TITLE_LENGTH
  )
  if (!isTitleExcerpt || !bodyContent) return {title, bodyContent}
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const hasAIAccess = await canAccessAI(team, dataLoader, true)
  if (!hasAIAccess) return {title, bodyContent}
  const manager = new OpenAIServerManager()
  const aiTitle = await manager.generateIssueTitle(
    tipTapToMarkdown(bodyContent),
    MAX_ISSUE_TITLE_LENGTH
  )
  return {title: aiTitle ?? title, bodyContent}
}

export default getIssueTitleAndBody
