import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SelectRetroTemplateMutation from '../../../mutations/SelectRetroTemplateMutation'
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
  margin: 'auto 40px',
  padding: 8
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
  selectedTemplateId: string
  showPublicTemplates: () => void
  teamId: string
  teamTemplates: ReflectTemplateListTeam_teamTemplates
}

const ReflectTemplateListTeam = (props: Props) => {
  const {selectedTemplateId, showPublicTemplates, teamId, teamTemplates} = props
  const atmosphere = useAtmosphere()
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
      {
        teamTemplates.map((template) => {
          const selectTemplate = () => {
            SelectRetroTemplateMutation(atmosphere, {selectedTemplateId: template.id, teamId})
          }
          return <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === selectedTemplateId}
            onClick={selectTemplate}
            lowestScope={'TEAM'}
            teamId={teamId}
          />
        })
      }
    </TemplateList>
  )
}

export default createFragmentContainer(
  ReflectTemplateListTeam,
  {
    teamTemplates: graphql`
      fragment ReflectTemplateListTeam_teamTemplates on ReflectTemplate @relay(plural: true) {
        id
        ...ReflectTemplateItem_template
      }
    `
  }
)
