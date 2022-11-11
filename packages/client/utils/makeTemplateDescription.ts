import graphql from 'babel-plugin-relay/macro'
import {readInlineData, useFragment} from 'react-relay'
import {makeTemplateDescription_template$key} from '../__generated__/makeTemplateDescription_template.graphql'
import {makeTemplateDescription_viewer$key} from '../__generated__/makeTemplateDescription_viewer.graphql'
import {TierEnum} from '../__generated__/SendClientSegmentEventMutation.graphql'
import relativeDate from './date/relativeDate'

const makeTemplateDescription = (
  lowestScope: string,
  templateRef: makeTemplateDescription_template$key,
  viewerRef: makeTemplateDescription_viewer$key | null,
  tier?: TierEnum
) => {
  const template = readInlineData(
    graphql`
      fragment makeTemplateDescription_template on MeetingTemplate @inline {
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
  const viewer = useFragment(
    graphql`
      fragment makeTemplateDescription_viewer on User {
        featureFlags {
          templateLimit
        }
      }
    `,
    viewerRef ?? null
  )
  const showTemplateLimit = viewer?.featureFlags.templateLimit
  const {lastUsedAt, team, isFree} = template
  const {name: teamName} = team
  if (lowestScope === 'PUBLIC' && showTemplateLimit) {
    return isFree ? 'Free template' : `Premium template ${tier === 'personal' ? '🔒' : '✨'}`
  }
  if (lowestScope === 'TEAM')
    return lastUsedAt
      ? `Last used ${relativeDate(lastUsedAt, {smallDiff: 'just now'})}`
      : 'Never used'
  return `Created by ${teamName}`
}

export default makeTemplateDescription
