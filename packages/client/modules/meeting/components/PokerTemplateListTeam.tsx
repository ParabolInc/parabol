import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../../../mutations/SendClientSegmentEventMutation'
import {PALETTE} from '../../../styles/paletteV3'
import {PokerTemplateListTeam_team$key} from '../../../__generated__/PokerTemplateListTeam_team.graphql'
import {PokerTemplateListTeam_teamTemplates$key} from '../../../__generated__/PokerTemplateListTeam_teamTemplates.graphql'
import {PokerTemplateListTeam_viewer$key} from '../../../__generated__/PokerTemplateListTeam_viewer.graphql'
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

const StyledLink = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
})

interface Props {
  isActive: boolean
  activeTemplateId: string
  showPublicTemplates: () => void
  teamTemplatesRef: PokerTemplateListTeam_teamTemplates$key
  teamRef: PokerTemplateListTeam_team$key
  viewerRef: PokerTemplateListTeam_viewer$key
}

const PokerTemplateListTeam = (props: Props) => {
  const {isActive, activeTemplateId, showPublicTemplates, teamTemplatesRef, viewerRef, teamRef} =
    props
  const teamTemplates = useFragment(
    graphql`
      fragment PokerTemplateListTeam_teamTemplates on PokerTemplate @relay(plural: true) {
        id
        ...PokerTemplateItem_template
      }
    `,
    teamTemplatesRef
  )
  const {featureFlags} = useFragment(
    graphql`
      fragment PokerTemplateListTeam_viewer on User {
        featureFlags {
          templateLimit
        }
      }
    `,
    viewerRef
  )
  const team = useFragment(
    graphql`
      fragment PokerTemplateListTeam_team on Team {
        id
        orgId
        tier
      }
    `,
    teamRef
  )
  const {id: teamId, tier, orgId} = team
  const edges = teamTemplates.map((t) => ({node: {id: t.id}})) as readonly {node: {id: string}}[]
  useActiveTopTemplate(edges, activeTemplateId, teamId, isActive, 'poker')
  const atmosphere = useAtmosphere()
  const history = useHistory()
  if (teamTemplates.length === 0) {
    if (tier === 'starter' && featureFlags.templateLimit) {
      const goToBilling = () => {
        SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
          upgradeCTALocation: 'teamTemplate',
          meetingType: 'poker'
        })
        history.push(`/me/organizations/${orgId}`)
      }
      return (
        <Message>
          <StyledLink onClick={goToBilling}>Upgrade </StyledLink>
          <span>to create custom templates for your team</span>
        </Message>
      )
    }
    return (
      <Message>
        <span>Your custom templates will show up here. Get started with a </span>
        <StyledLink onClick={showPublicTemplates}>Public Template</StyledLink>
      </Message>
    )
  }
  return (
    <TemplateList>
      {teamTemplates.map((template) => {
        return (
          <PokerTemplateItem
            key={template.id}
            templateRef={template}
            isActive={template.id === activeTemplateId}
            lowestScope={'TEAM'}
            teamId={teamId}
          />
        )
      })}
    </TemplateList>
  )
}

export default PokerTemplateListTeam
