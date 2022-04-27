import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {usePreloadedQuery, PreloadedQuery} from 'react-relay'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import ReflectTemplateItem from './ReflectTemplateItem'
import {ReflectTemplateListPublicQuery} from '../../../__generated__/ReflectTemplateListPublicQuery.graphql'

const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})

interface Props {
  queryRef: PreloadedQuery<ReflectTemplateListPublicQuery>
}

const query = graphql`
  query ReflectTemplateListPublicQuery($teamId: ID!) {
    viewer {
      id
      team(teamId: $teamId) {
        id
        meetingSettings(meetingType: retrospective) {
          ... on RetrospectiveMeetingSettings {
            publicTemplates(first: 50)
              @connection(key: "ReflectTemplateListPublic_publicTemplates") {
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

const ReflectTemplateListPublic = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ReflectTemplateListPublicQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const team = viewer.team!
  const {id: teamId, meetingSettings} = team
  const publicTemplates = meetingSettings.publicTemplates!
  const activeTemplateId = meetingSettings.activeTemplate?.id ?? '-tmp'
  const {edges} = publicTemplates
  useActiveTopTemplate(edges, activeTemplateId, teamId, true, 'retrospective')
  return (
    <TemplateList>
      {edges.map(({node: template}) => {
        return (
          <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            lowestScope={'PUBLIC'}
            teamId={teamId}
          />
        )
      })}
    </TemplateList>
  )
}

export default ReflectTemplateListPublic
