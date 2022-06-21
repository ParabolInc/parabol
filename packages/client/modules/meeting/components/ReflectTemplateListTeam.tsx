import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useActiveTopTemplate from '../../../hooks/useActiveTopTemplate'
import {PALETTE} from '../../../styles/paletteV3'
import {ReflectTemplateListTeam_settings$key} from '../../../__generated__/ReflectTemplateListTeam_settings.graphql'
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
}

const ReflectTemplateListTeam = (props: Props) => {
  const {isActive, activeTemplateId, showPublicTemplates, teamId, settingsRef} = props
  const settings = useFragment(
    graphql`
      fragment ReflectTemplateListTeam_settings on RetrospectiveMeetingSettings {
        templateSearchQuery
        teamTemplates {
          ...ReflectTemplateItem_template
          id
          name
        }
      }
    `,
    settingsRef
  )
  const {teamTemplates, templateSearchQuery} = settings
  const edges = teamTemplates.map((t) => ({node: {id: t.id}})) as readonly {node: {id: string}}[]
  useActiveTopTemplate(edges, activeTemplateId, teamId, isActive, 'retrospective')
  const filteredTemplates = teamTemplates.filter(({name}) =>
    name.toLowerCase().includes(templateSearchQuery ?? '')
  )
  if (teamTemplates.length === 0) {
    return (
      <Message>
        <span>Your custom templates will show up here. Get started with a </span>
        <StyledLink onClick={showPublicTemplates}>Public Template</StyledLink>
      </Message>
    )
  }
  if (filteredTemplates.length === 0) {
    return <Message>{`No team templates match your search query "${templateSearchQuery}"`}</Message>
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
          />
        )
      })}
    </TemplateList>
  )
}

export default ReflectTemplateListTeam
