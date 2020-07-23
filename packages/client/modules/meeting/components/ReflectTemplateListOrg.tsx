import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ReflectTemplateListOrg_viewer} from '../../../__generated__/ReflectTemplateListOrg_viewer.graphql'
import ReflectTemplateItem from './ReflectTemplateItem'
const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})


interface Props {
  activeTemplateId: string
  setActiveTemplateId: (templateId: string) => void
  viewer: ReflectTemplateListOrg_viewer
}

const ReflectTemplateListTeam = (props: Props) => {
  const {activeTemplateId, setActiveTemplateId, viewer} = props
  const {team} = viewer
  if (!team) return null
  const {meetingSettings} = team
  const {organizationTemplates} = meetingSettings
  if (!organizationTemplates) return null
  const {edges} = organizationTemplates
  if (edges.length === 0) {
    return (
      <div>
        No other teams in your organization are sharing a template
      </div>
    )
  }
  return (
    <TemplateList>
      {
        edges.map(({node: template}) => {
          return <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            onClick={() => setActiveTemplateId(template.id)}
          />
        })
      }
    </TemplateList>
  )
}

export default createFragmentContainer(
  ReflectTemplateListTeam,
  {
    viewer: graphql`
      fragment ReflectTemplateListOrg_viewer on User {
        id
        team(teamId: $teamId) {
          meetingSettings(meetingType: retrospective) {
            ...on RetrospectiveMeetingSettings {
              organizationTemplates(first: 20) {
                edges {
                  node {
                    ...ReflectTemplateItem_template
                    id
                  }
                }
              }
            }
          }
        }
      }
    `
  }
)
