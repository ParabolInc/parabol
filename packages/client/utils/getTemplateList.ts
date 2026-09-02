import {datadogLogs} from '@datadog/browser-logs'
import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {getTemplateList_template$key} from '../__generated__/getTemplateList_template.graphql'

const getTemplateList = (
  viewerTeamId: string,
  viewerOrgId: string,
  templateRef: getTemplateList_template$key
) => {
  const template = readInlineData(
    graphql`
      fragment getTemplateList_template on MeetingTemplate @inline {
        id
        team {
          id
          orgId
        }
      }
    `,
    templateRef
  )
  const {id: templateId, team} = template
  if (!team) {
    datadogLogs.logger.error('NO TEAM ON TEMPLATE WTF', {viewerTeamId, templateId})
    return 'TEAM'
  }
  const {id: teamId, orgId} = team
  return teamId === viewerTeamId ? 'TEAM' : orgId === viewerOrgId ? 'ORGANIZATION' : 'PUBLIC'
}

export default getTemplateList
