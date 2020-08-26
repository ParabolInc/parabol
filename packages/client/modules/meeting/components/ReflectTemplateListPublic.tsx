import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useSelectTopTemplate from '../../../hooks/useSelectTopTemplate'
import {ReflectTemplateListPublic_viewer} from '../../../__generated__/ReflectTemplateListPublic_viewer.graphql'
import ReflectTemplateItem from './ReflectTemplateItem'

const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})


interface Props {
  viewer: ReflectTemplateListPublic_viewer
}

const ReflectTemplateListPublic = (props: Props) => {
  const {viewer} = props
  const team = viewer.team!
  const {id: teamId, meetingSettings} = team
  const publicTemplates = meetingSettings.publicTemplates!
  const selectedTemplateId = meetingSettings.selectedTemplateId!
  const {edges} = publicTemplates
  useSelectTopTemplate(edges, selectedTemplateId, teamId, true)
  return (
    <TemplateList>
      {
        edges.map(({node: template}) => {
          return <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === selectedTemplateId}
            lowestScope={'PUBLIC'}
            teamId={teamId}
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
          id
          meetingSettings(meetingType: retrospective) {
            ...on RetrospectiveMeetingSettings {
              publicTemplates(first: 20) @connection(key: "ReflectTemplateListPublic_publicTemplates"){
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
  }
)
