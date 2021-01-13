import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useSelectTopTemplate from '../../../hooks/useSelectTopTemplate'
import {PALETTE} from '../../../styles/paletteV2'
import {ReflectTemplateListTeam_teamTemplates} from '../../../__generated__/ReflectTemplateListTeam_teamTemplates.graphql'
import ReflectTemplateItem from './ReflectTemplateItem'

const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})

const Message = styled('div')({
  border: `1px dashed ${PALETTE.BORDER_GRAY}`,
  borderRadius: 4,
  color: PALETTE.TEXT_GRAY,
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: '20px',
  margin: 'auto 32px',
  padding: '8px 16px'
})

const StyledLink = styled('span')({
  color: PALETTE.LINK_BLUE,
  cursor: 'pointer',
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.LINK_BLUE_HOVER
  }
})

interface Props {
  isActive: boolean
  selectedTemplateId: string
  showPublicTemplates: () => void
  teamId: string
  teamTemplates: ReflectTemplateListTeam_teamTemplates
}

const ReflectTemplateListTeam = (props: Props) => {
  const {isActive, selectedTemplateId, showPublicTemplates, teamId, teamTemplates} = props
  const edges = teamTemplates.map((t) => ({node: {id: t.id}})) as readonly {node: {id: string}}[]
  useSelectTopTemplate(edges, selectedTemplateId, teamId, isActive)
  if (teamTemplates.length === 0) {
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
          <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === selectedTemplateId}
            lowestScope={'TEAM'}
            teamId={teamId}
          />
        )
      })}
    </TemplateList>
  )
}

export default createFragmentContainer(ReflectTemplateListTeam, {
  teamTemplates: graphql`
    fragment ReflectTemplateListTeam_teamTemplates on ReflectTemplate @relay(plural: true) {
      id
      ...ReflectTemplateItem_template
    }
  `
})
