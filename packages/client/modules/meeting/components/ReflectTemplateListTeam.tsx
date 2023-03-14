import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import useFilteredItems from '~/hooks/useFilteredItems'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../../../mutations/SendClientSegmentEventMutation'
import {PALETTE} from '../../../styles/paletteV3'
import {ReflectTemplateListTeam_viewer$key} from '../../../__generated__/ReflectTemplateListTeam_viewer.graphql'
import {
  ReflectTemplateListTeam_teamTemplates$key,
  ReflectTemplateListTeam_teamTemplates
} from '../../../__generated__/ReflectTemplateListTeam_teamTemplates.graphql'
import {ReflectTemplateListTeam_team$key} from '../../../__generated__/ReflectTemplateListTeam_team.graphql'
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
  teamTemplatesRef: ReflectTemplateListTeam_teamTemplates$key
  teamRef: ReflectTemplateListTeam_team$key
  viewerRef: ReflectTemplateListTeam_viewer$key
  templateSearchQuery: string
}

const getValue = (item: ReflectTemplateListTeam_teamTemplates[0]) => {
  return item.name.toLowerCase()
}

const ReflectTemplateListTeam = (props: Props) => {
  const {
    isActive,
    activeTemplateId,
    showPublicTemplates,
    templateSearchQuery,
    teamTemplatesRef,
    teamRef,
    viewerRef
  } = props
  const teamTemplates = useFragment(
    graphql`
      fragment ReflectTemplateListTeam_teamTemplates on ReflectTemplate @relay(plural: true) {
        id
        name
        ...ReflectTemplateItem_template
      }
    `,
    teamTemplatesRef
  )
  const {featureFlags} = useFragment(
    graphql`
      fragment ReflectTemplateListTeam_viewer on User {
        featureFlags {
          templateLimit
        }
      }
    `,
    viewerRef
  )
  const team = useFragment(
    graphql`
      fragment ReflectTemplateListTeam_team on Team {
        id
        orgId
        tier
      }
    `,
    teamRef
  )
  const history = useHistory()
  const atmosphere = useAtmosphere()
  const {orgId, tier, id: teamId} = team
  const searchQuery = templateSearchQuery ?? ''
  const edges = teamTemplates.map((t) => ({node: {id: t.id}})) as readonly {node: {id: string}}[]
  useActiveTopTemplate(edges, activeTemplateId, teamId, isActive, 'retrospective')
  const filteredTemplates = useFilteredItems(searchQuery, teamTemplates, getValue)
  if (teamTemplates.length === 0) {
    if (tier === 'starter' && featureFlags.templateLimit) {
      const goToBilling = () => {
        SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
          upgradeCTALocation: 'teamTemplate',
          meetingType: 'retrospective'
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
  if (filteredTemplates.length === 0) {
    return <Message>{`No team templates match your search query "${searchQuery}"`}</Message>
  }
  return (
    <TemplateList>
      {teamTemplates.map((template) => {
        return (
          <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            lowestScope={'TEAM'}
            teamId={teamId}
            templateSearchQuery={searchQuery}
          />
        )
      })}
    </TemplateList>
  )
}

export default ReflectTemplateListTeam
