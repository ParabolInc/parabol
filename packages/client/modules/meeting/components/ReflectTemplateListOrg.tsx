import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useFilteredItems from '~/hooks/useFilteredItems'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import {PALETTE} from '../../../styles/paletteV3'
import {ReflectTemplateListOrgQuery} from '../../../__generated__/ReflectTemplateListOrgQuery.graphql'
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
  queryRef: PreloadedQuery<ReflectTemplateListOrgQuery>
}

const getValue = (item: {node: {id: string; name: string}}) => {
  return item.node.name.toLowerCase()
}

const query = graphql`
  query ReflectTemplateListOrgQuery($teamId: ID!) {
    viewer {
      id
      team(teamId: $teamId) {
        id
        meetingSettings(meetingType: retrospective) {
          ... on RetrospectiveMeetingSettings {
            templateSearchQuery
            organizationTemplates(first: 20)
              @connection(key: "ReflectTemplateListOrg_organizationTemplates") {
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

const ReflectTemplateListOrg = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ReflectTemplateListOrgQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const team = viewer.team!
  const {id: teamId, meetingSettings} = team
  const {templateSearchQuery, organizationTemplates, activeTemplate} = meetingSettings
  const searchQuery = templateSearchQuery ?? ''
  const activeTemplateId = activeTemplate?.id ?? '-tmp'
  const {edges} = organizationTemplates!
  const filteredEdges = useFilteredItems(searchQuery, edges, getValue)
  useActiveTopTemplate(edges, activeTemplateId, teamId, true, 'retrospective')

  if (edges.length === 0) {
    return <Message>{'No other teams in your organization are sharing a template.'}</Message>
  }
  if (filteredEdges.length === 0) {
    return (
      <Message>{`No template names in your organization match your search query "${searchQuery}"`}</Message>
    )
  }
  return (
    <TemplateList>
      {filteredEdges.map(({node: template}) => {
        return (
          <ReflectTemplateItem
            key={template.id}
            templateRef={template}
            isActive={template.id === activeTemplateId}
            lowestScope={'ORGANIZATION'}
            teamId={teamId}
            templateSearchQuery={searchQuery}
            viewerRef={null}
          />
        )
      })}
    </TemplateList>
  )
}

export default ReflectTemplateListOrg
