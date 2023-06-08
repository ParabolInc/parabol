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

// We're not showing public templates created after June 5, 2023, since all of these should *only*
// be shown in the new activity library, and not in the older new meeting modal.
const MAX_PUBLIC_CREATED_AT = '2023-06-05T00:00:00Z'

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
            publicTemplates(first: 100)
              @connection(key: "ReflectTemplateListPublic_publicTemplates") {
              edges {
                node {
                  ...ReflectTemplateItem_template
                  id
                  name
                  createdAt
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
  const data = usePreloadedQuery<ReflectTemplateListPublicQuery>(query, queryRef)
  const {viewer} = data
  const team = viewer.team!
  const {id: teamId, meetingSettings, tier} = team
  const {templateSearchQuery, publicTemplates, activeTemplate} = meetingSettings
  const searchQuery = templateSearchQuery ?? ''
  const activeTemplateId = activeTemplate?.id ?? '-tmp'
  const {edges} = publicTemplates!
  const filteredEdges = useFilteredItems(searchQuery, edges, getValue).filter(
    ({node}) => node.createdAt < MAX_PUBLIC_CREATED_AT
  )
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
