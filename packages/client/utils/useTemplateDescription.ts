import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'react-relay'
import {useTemplateDescription_template$key} from '../__generated__/useTemplateDescription_template.graphql'
import {useTemplateDescription_viewer$key} from '../__generated__/useTemplateDescription_viewer.graphql'
import {TierEnum} from '../__generated__/OrganizationSubscription.graphql'
import relativeDate from './date/relativeDate'

const useTemplateDescription = (
  lowestScope: string,
  templateRef?: useTemplateDescription_template$key,
  tier?: TierEnum,
  viewerRef?: useTemplateDescription_viewer$key
) => {
  if (!templateRef) {
    return null
  }

  const template = readInlineData(
    graphql`
      fragment useTemplateDescription_template on MeetingTemplate @inline {
        lastUsedAt
        scope
        isFree
        team {
          name
        }
      }
    `,
    templateRef
  )

  const viewer = readInlineData(
    graphql`
      fragment useTemplateDescription_viewer on User @inline {
        id
        featureFlags {
          noTemplateLimit
        }
      }
    `,
    viewerRef ?? null
  )

  const {lastUsedAt, team, isFree} = template
  const {name: teamName} = team
  if (lowestScope === 'PUBLIC') {
    return isFree
      ? 'Free template'
      : `Premium template ${
          tier === 'starter' && !viewer?.featureFlags?.noTemplateLimit ? '🔒' : '✨'
        }`
  }
  if (lowestScope === 'TEAM')
    return lastUsedAt
      ? `Last used ${relativeDate(lastUsedAt, {smallDiff: 'just now'})}`
      : 'Never used'
  return `Created by ${teamName}`
}

export default useTemplateDescription
