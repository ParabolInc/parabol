import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import {getTemplateList_template} from '../__generated__/getTemplateList_template.graphql'

const getTemplateList = (viewerTeamId: string, viewerOrgId: string, templateRef: any) => {
  const template = readInlineData<getTemplateList_template>(
    graphql`
      fragment getTemplateList_template on ReflectTemplate @inline {
        team {
          id
          orgId
        }
      }
    `,
    templateRef
  )
  const {team} = template
  const {id: teamId, orgId} = team
  return teamId === viewerTeamId ? 'TEAM' : orgId === viewerOrgId ? 'ORGANIZATION' : 'PUBLIC'
}

export default getTemplateList
