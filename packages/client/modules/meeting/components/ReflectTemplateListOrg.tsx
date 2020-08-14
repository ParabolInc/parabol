import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useSelectTopTemplate from '../../../hooks/useSelectTopTemplate'
import {PALETTE} from '../../../styles/paletteV2'
import {ReflectTemplateListOrg_viewer} from '../../../__generated__/ReflectTemplateListOrg_viewer.graphql'
import ReflectTemplateItem from './ReflectTemplateItem'
const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})

const Message = styled('div')({
  border: `1px dashed ${PALETTE.BORDER_GRAY}`,
  borderRadius: 4,
  color: PALETTE.TEXT_GRAY,
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: '20px',
  margin: 'auto 32px',
  padding: '8px 16px'
})
interface Props {
  viewer: ReflectTemplateListOrg_viewer
}

const ReflectTemplateListOrg = (props: Props) => {
  const {viewer} = props
  const team = viewer.team!
  const {id: teamId, meetingSettings} = team
  const selectedTemplateId = meetingSettings.selectedTemplateId!
  const organizationTemplates = meetingSettings.organizationTemplates!
  const {edges} = organizationTemplates
  useSelectTopTemplate(edges, selectedTemplateId, teamId, true)

  if (edges.length === 0) {
    return <Message>{'No other teams in your organization are sharing a template.'}</Message>
  }
  return (
    <TemplateList>
      {edges.map(({node: template}) => {
        return (
          <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === selectedTemplateId}
            lowestScope={'ORGANIZATION'}
            teamId={teamId}
          />
        )
      })}
    </TemplateList>
  )
}

export default createFragmentContainer(ReflectTemplateListOrg, {
  viewer: graphql`
    fragment ReflectTemplateListOrg_viewer on User {
      id
      team(teamId: $teamId) {
        id
        meetingSettings(meetingType: retrospective) {
          ... on RetrospectiveMeetingSettings {
            organizationTemplates(first: 20) @connection(key: "ReflectTemplateListOrg_organizationTemplates") {
              edges {
                node {
                  ...ReflectTemplateItem_template
                  id
                }
              }
            }
            selectedTemplateId
          }
        }
      }
    }
  `
})
