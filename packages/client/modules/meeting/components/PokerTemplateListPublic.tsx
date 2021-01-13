import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useSelectTopTemplate from '../../../hooks/useSelectTopTemplate'
import {PokerTemplateListPublic_viewer} from '../../../__generated__/PokerTemplateListPublic_viewer.graphql'
import PokerTemplateItem from './PokerTemplateItem'

const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})


interface Props {
  viewer: PokerTemplateListPublic_viewer
}

const PokerTemplateListPublic = (props: Props) => {
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
          return <PokerTemplateItem
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
  PokerTemplateListPublic,
  {
    viewer: graphql`
      fragment PokerTemplateListPublic_viewer on User {
        id
        team(teamId: $teamId) {
          id
          meetingSettings(meetingType: poker) {
            ...on PokerMeetingSettings {
              publicTemplates(first: 20) @connection(key: "PokerTemplateListPublic_publicTemplates"){
                edges {
                  node {
                    ...PokerTemplateItem_template
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
