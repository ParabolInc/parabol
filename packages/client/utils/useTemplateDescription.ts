import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'react-relay'
import {useTemplateDescription_template$key} from '../__generated__/useTemplateDescription_template.graphql'
import relativeDate from './date/relativeDate'

const useTemplateDescription = (
  lowestScope: string,
  templateRef?: useTemplateDescription_template$key
) => {
  if (!templateRef) {
    return null
  }

  const template = readInlineData(
    graphql`
      fragment useTemplateDescription_template on MeetingTemplate @inline {
        lastUsedAt
        scope
        team {
          name
        }
      }
    `,
    templateRef
  )

  const {lastUsedAt, team} = template
  const {name: teamName} = team
  if (lowestScope === 'PUBLIC') {
    return 'Public template'
  }
  if (lowestScope === 'TEAM')
    return lastUsedAt
      ? `Last used ${relativeDate(lastUsedAt, {smallDiff: 'just now'})}`
      : 'Never used'
  return `Created by ${teamName}`
}

export default useTemplateDescription
