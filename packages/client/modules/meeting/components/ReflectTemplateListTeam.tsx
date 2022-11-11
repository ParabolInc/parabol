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
import {
  ReflectTemplateListTeam_settings,
  ReflectTemplateListTeam_settings$key
} from '../../../__generated__/ReflectTemplateListTeam_settings.graphql'
import {ReflectTemplateListTeam_viewer$key} from '../../../__generated__/ReflectTemplateListTeam_viewer.graphql'
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
  teamId: string
  settingsRef: ReflectTemplateListTeam_settings$key
  viewerRef: ReflectTemplateListTeam_viewer$key
}

const getValue = (item: ReflectTemplateListTeam_settings['teamTemplates'][0]) => {
  return item.name.toLowerCase()
}

const ReflectTemplateListTeam = (props: Props) => {
  const {isActive, activeTemplateId, showPublicTemplates, teamId, settingsRef, viewerRef} = props
  const settings = useFragment(
    graphql`
      fragment ReflectTemplateListTeam_settings on RetrospectiveMeetingSettings {
        templateSearchQuery
        teamTemplates {
          ...ReflectTemplateItem_template
          id
          name
        }
        team {
          orgId
          tier
        }
      }
    `,
    settingsRef
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
  const history = useHistory()
  const atmosphere = useAtmosphere()
  const {teamTemplates, templateSearchQuery, team} = settings
  const {orgId, tier} = team
  const searchQuery = templateSearchQuery ?? ''
  const edges = teamTemplates.map((t) => ({node: {id: t.id}})) as readonly {node: {id: string}}[]
  useActiveTopTemplate(edges, activeTemplateId, teamId, isActive, 'retrospective')
  const filteredTemplates = useFilteredItems(searchQuery, teamTemplates, getValue)
  if (teamTemplates.length === 0) {
    if (tier === 'personal' && featureFlags.templateLimit) {
      const goToBilling = () => {
        SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
          upgradeCTALocation: 'teamTemplate',
          meetingType: 'retrospective'
        })
        history.push(`/me/organizations/${orgId}`)
      }
      return (
        <Message>
          <StyledLink onClick={goToBilling}>Upgrade to Pro </StyledLink>
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
      {filteredTemplates.map((template) => {
        return (
          <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            lowestScope={'TEAM'}
            teamId={teamId}
            templateSearchQuery={searchQuery}
            viewer={null}
          />
        )
      })}
    </TemplateList>
  )
}

export default ReflectTemplateListTeam
