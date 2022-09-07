import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import {PALETTE} from '../../../styles/paletteV3'
import {PokerTemplateListOrgQuery} from '../../../__generated__/PokerTemplateListOrgQuery.graphql'
import PokerTemplateItem from './PokerTemplateItem'

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
  queryRef: PreloadedQuery<PokerTemplateListOrgQuery>
}

const query = graphql`
  query PokerTemplateListOrgQuery($teamId: ID!) {
    viewer {
      id
      team(teamId: $teamId) {
        id
        meetingSettings(meetingType: poker) {
          ... on PokerMeetingSettings {
            organizationTemplates(first: 20)
              @connection(key: "PokerTemplateListOrg_organizationTemplates") {
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
const PokerTemplateListOrg = (props: Props) => {
  const {queryRef} = props

  const {t} = useTranslation()

  const data = usePreloadedQuery<PokerTemplateListOrgQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const team = viewer.team!
  const {id: teamId, meetingSettings} = team
  const activeTemplateId = meetingSettings.activeTemplate?.id ?? '-tmp'
  const organizationTemplates = meetingSettings.organizationTemplates!
  const {edges} = organizationTemplates
  useActiveTopTemplate(edges, activeTemplateId, teamId, true, 'poker')

  if (edges.length === 0) {
    return (
      <Message>
        {t('PokerTemplateListOrg.NoOtherTeamsInYourOrganizationAreSharingATemplate')}
      </Message>
    )
  }
  return (
    <TemplateList>
      {edges.map(({node: template}) => {
        return (
          <PokerTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            lowestScope={t('PokerTemplateListOrg.Organization')}
            teamId={teamId}
          />
        )
      })}
    </TemplateList>
  )
}

export default PokerTemplateListOrg
