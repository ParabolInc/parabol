import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ReflectTemplateListTeam_viewer} from '../../../__generated__/ReflectTemplateListTeam_viewer.graphql'
import ReflectTemplateItem from './ReflectTemplateItem'
const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})


interface Props {
  activeTemplateId: string
  setActiveTemplateId: (templateId: string) => void
  showPublicTemplates: () => void
  viewer: ReflectTemplateListTeam_viewer
}

const ReflectTemplateListTeam = (props: Props) => {
  const {activeTemplateId, setActiveTemplateId, showPublicTemplates, viewer} = props
  const {team} = viewer
  if (!team) return null
  const {meetingSettings} = team
  const {teamTemplates} = meetingSettings
  if (!teamTemplates) return null
  if (teamTemplates.length === 0) {
    return (
      <>
        <div>Your custom templates will show up here. Get started with a</div>
        <div onClick={showPublicTemplates}>Public Template</div>
      </>
    )
  }
  return (
    <TemplateList>
      {
        teamTemplates.map((template) => {
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
      fragment ReflectTemplateListTeam_viewer on User {
        id
        team(teamId: $teamId) {
          meetingSettings(meetingType: retrospective) {
            ...on RetrospectiveMeetingSettings {
            teamTemplates {
              id
              ...ReflectTemplateItem_template
            }
          }
          }
        }
      }
    `
  }
)
