import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useFilteredItems from '~/hooks/useFilteredItems'
import {PALETTE} from '~/styles/paletteV3'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import {ReflectTemplateListPublicQuery} from '../../../__generated__/ReflectTemplateListPublicQuery.graphql'
import ReflectTemplateItem from './ReflectTemplateItem'

const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})

const Message = styled('div')({
  border: `1px dashed ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: '20px',
  margin: 'auto 32px',
  padding: '8px 16px'
})

interface Props {
  queryRef: PreloadedQuery<ReflectTemplateListPublicQuery>
}

const getValue = (item: {node: {id: string; name: string}}) => {
  return item.node.name.toLowerCase()
}

const query = graphql`
  query ReflectTemplateListPublicQuery($teamId: ID!) {
    viewer {
      ...ReflectTemplateItem_viewer
      id
      team(teamId: $teamId) {
        id
        tier
        meetingSettings(meetingType: retrospective) {
          ... on RetrospectiveMeetingSettings {
            templateSearchQuery
            publicTemplates(first: 50)
              @connection(key: "ReflectTemplateListPublic_publicTemplates") {
              edges {
                node {
                  ...ReflectTemplateItem_template
                  id
                  name
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

const ReflectTemplateListPublic = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ReflectTemplateListPublicQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const team = viewer.team!
  const {id: teamId, meetingSettings, tier} = team
  const {templateSearchQuery, publicTemplates, activeTemplate} = meetingSettings
  const searchQuery = templateSearchQuery ?? ''
  const activeTemplateId = activeTemplate?.id ?? '-tmp'
  const {edges} = publicTemplates!
  const filteredEdges = useFilteredItems(searchQuery, edges, getValue)
  useActiveTopTemplate(edges, activeTemplateId, teamId, true, 'retrospective')
  if (filteredEdges.length === 0) {
    return <Message>{`No public templates match your search query "${searchQuery}"`}</Message>
  }
  return (
    <TemplateList>
      {filteredEdges.map(({node: template}) => {
        return (
          <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            lowestScope={'PUBLIC'}
            teamId={teamId}
            tier={tier}
            templateSearchQuery={searchQuery}
            viewer={viewer}
          />
        )
      })}
    </TemplateList>
  )
}

export default ReflectTemplateListPublic
