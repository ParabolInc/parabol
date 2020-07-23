import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ReflectTemplateListPublic_viewer} from '../../../__generated__/ReflectTemplateListPublic_viewer.graphql'
import ReflectTemplateItem from './ReflectTemplateItem'
const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})


interface Props {
  activeTemplateId: string
  setActiveTemplateId: (templateId: string) => void
  viewer: ReflectTemplateListPublic_viewer
}

const ReflectTemplateListPublic = (props: Props) => {
  const {activeTemplateId, setActiveTemplateId, viewer} = props
  const {team} = viewer
  if (!team) return null
  const {meetingSettings} = team
  const {publicTemplates} = meetingSettings
  if (!publicTemplates) return null
  const {edges} = publicTemplates
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
  ReflectTemplateListPublic,
  {
    viewer: graphql`
      fragment ReflectTemplateListPublic_viewer on User {
        id
        team(teamId: $teamId) {
          meetingSettings(meetingType: retrospective) {
            ...on RetrospectiveMeetingSettings {
              publicTemplates(first: 20) {
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
