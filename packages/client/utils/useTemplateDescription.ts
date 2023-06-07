import graphql from 'babel-plugin-relay/macro'
import {readInlineData, useFragment} from 'react-relay'
import {useTemplateDescription_template$key} from '../__generated__/useTemplateDescription_template.graphql'
import {useTemplateDescription_viewer$key} from '../__generated__/useTemplateDescription_viewer.graphql'
import {TierEnum} from '../__generated__/SendClientSegmentEventMutation.graphql'
import relativeDate from './date/relativeDate'

const useTemplateDescription = (
  lowestScope: string,
  templateRef?: useTemplateDescription_template$key,
  viewerRef?: useTemplateDescription_viewer$key | null,
  tier?: TierEnum
) => {
  const viewer = useFragment(
    graphql`
      fragment useTemplateDescription_viewer on User {
        featureFlags {
          templateLimit
        }
      }
    `,
    viewerRef ?? null
  )

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

  const showTemplateLimit = viewer?.featureFlags.templateLimit
  const {lastUsedAt, team, isFree} = template
  const {name: teamName} = team
  if (lowestScope === 'PUBLIC' && showTemplateLimit) {
    return isFree ? 'Free template' : `Premium template ${tier === 'starter' ? '🔒' : '✨'}`
  }
  if (lowestScope === 'TEAM')
    return lastUsedAt
      ? `Last used ${relativeDate(lastUsedAt, {smallDiff: 'just now'})}`
      : 'Never used'
  return `Created by ${teamName}`
}

export default useTemplateDescription
