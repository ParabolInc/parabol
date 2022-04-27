import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {usePreloadedQuery, PreloadedQuery} from 'react-relay'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import {PALETTE} from '../../../styles/paletteV3'
import ReflectTemplateItem from './ReflectTemplateItem'
import {ReflectTemplateListOrgQuery} from '../../../__generated__/ReflectTemplateListOrgQuery.graphql'

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

const query = graphql`
  query ReflectTemplateListOrgQuery($teamId: ID!) {
    viewer {
      id
      team(teamId: $teamId) {
        id
        meetingSettings(meetingType: retrospective) {
          ... on RetrospectiveMeetingSettings {
            organizationTemplates(first: 20)
              @connection(key: "ReflectTemplateListOrg_organizationTemplates") {
              edges {
                node {
                  ...ReflectTemplateItem_template
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

const ReflectTemplateListOrg = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ReflectTemplateListOrgQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const team = viewer.team!
  const {id: teamId, meetingSettings} = team
  const activeTemplateId = meetingSettings.activeTemplate?.id ?? '-tmp'
  const organizationTemplates = meetingSettings.organizationTemplates!
  const {edges} = organizationTemplates
  useActiveTopTemplate(edges, activeTemplateId, teamId, true, 'retrospective')

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
            isActive={template.id === activeTemplateId}
            lowestScope={'ORGANIZATION'}
            teamId={teamId}
          />
        )
      })}
    </TemplateList>
  )
}

export default ReflectTemplateListOrg
