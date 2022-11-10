import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useHistory} from 'react-router'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../../../mutations/SendClientSegmentEventMutation'
import {PALETTE} from '../../../styles/paletteV3'
import {PokerTemplateListOrgQuery} from '../../../__generated__/PokerTemplateListOrgQuery.graphql'
import PokerTemplateItem from './PokerTemplateItem'

const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})

const StyledLink = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
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
      featureFlags {
        templateLimit
      }
      team(teamId: $teamId) {
        id
        tier
        orgId
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
  const data = usePreloadedQuery<PokerTemplateListOrgQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const team = viewer.team!
  const featureFlags = viewer.featureFlags!
  const {id: teamId, meetingSettings, tier, orgId} = team
  const activeTemplateId = meetingSettings.activeTemplate?.id ?? '-tmp'
  const organizationTemplates = meetingSettings.organizationTemplates!
  const {edges} = organizationTemplates
  useActiveTopTemplate(edges, activeTemplateId, teamId, true, 'poker')
  const atmosphere = useAtmosphere()
  const history = useHistory()

  if (edges.length === 0) {
    if (tier === 'personal' && featureFlags.templateLimit) {
      const goToBilling = () => {
        SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
          upgradeCTALocation: 'orgTemplate',
          meetingType: 'poker'
        })
        history.push(`/me/organizations/${orgId}`)
      }
      return (
        <Message>
          <StyledLink onClick={goToBilling}>Upgrade to Pro </StyledLink>
          <span>to create custom templates for your organization</span>
        </Message>
      )
    }
    return <Message>{'No other teams in your organization are sharing a template.'}</Message>
  }
  return (
    <TemplateList>
      {edges.map(({node: template}) => {
        return (
          <PokerTemplateItem
            key={template.id}
            templateRef={template}
            isActive={template.id === activeTemplateId}
            lowestScope={'ORGANIZATION'}
            teamId={teamId}
            viewerRef={null}
          />
        )
      })}
    </TemplateList>
  )
}

export default PokerTemplateListOrg
