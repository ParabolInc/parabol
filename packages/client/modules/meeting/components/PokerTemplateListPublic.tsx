import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import {PokerTemplateListPublicQuery} from '../../../__generated__/PokerTemplateListPublicQuery.graphql'
import PokerTemplateItem from './PokerTemplateItem'

const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})

interface Props {
  queryRef: PreloadedQuery<PokerTemplateListPublicQuery>
}
const query = graphql`
  query PokerTemplateListPublicQuery($teamId: ID!) {
    viewer {
      ...PokerTemplateItem_viewer
      id
      team(teamId: $teamId) {
        id
        meetingSettings(meetingType: poker) {
          ... on PokerMeetingSettings {
            publicTemplates(first: 20) @connection(key: "PokerTemplateListPublic_publicTemplates") {
              edges {
                node {
                  ...PokerTemplateItem_template
                  id
                }
              }
            }
            activeTemplate {
              id
            }
          }
        }
      }
    }
  }
`

const PokerTemplateListPublic = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<PokerTemplateListPublicQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const team = viewer.team!
  const {id: teamId, meetingSettings} = team
  const publicTemplates = meetingSettings.publicTemplates!
  const activeTemplateId = meetingSettings.activeTemplate?.id ?? '-tmp'
  const {edges} = publicTemplates
  useActiveTopTemplate(edges, activeTemplateId, teamId, true, 'poker')
  return (
    <TemplateList>
      {edges.map(({node: template}) => {
        return (
          <PokerTemplateItem
            key={template.id}
            templateRef={template}
            isActive={template.id === activeTemplateId}
            lowestScope={'PUBLIC'}
            teamId={teamId}
            viewerRef={viewer}
          />
        )
      })}
    </TemplateList>
  )
}

export default PokerTemplateListPublic
