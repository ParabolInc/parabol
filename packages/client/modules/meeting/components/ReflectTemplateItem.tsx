import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '../../../components/Icon'
import {DECELERATE} from '../../../styles/animation'
import textOverflow from '../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'
import relativeDate from '../../../utils/date/relativeDate'
import {ReflectTemplateItem_template} from '../../../__generated__/ReflectTemplateItem_template.graphql'

const TemplateItem = styled('li')<{isActive: boolean}>(({isActive}) => ({

  backgroundColor: isActive ? PALETTE.BACKGROUND_MAIN_DARKENED : undefined,
  borderRadius: 2,
  cursor: 'pointer',
  display: 'flex',
  fontSize: 14,
  justifyContent: 'space-between',
  lineHeight: '22px',
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 16,
  transition: `background-color 300ms ${DECELERATE}`,
  width: '100%'
}))

const TemplateItemDetails = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const TemplateTitle = styled('div')({
  ...textOverflow,
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px'
})

const TemplateDescription = styled('div')({
  ...textOverflow,
  color: PALETTE.TEXT_GRAY,
  fontSize: 12,
  lineHeight: '16px'
})

const TemplateItemAction = styled('div')({

})

const EditIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18,
  padding: 8,
  paddingRight: 16
})

const makeDescription = (template: ReflectTemplateItem_template) => {
  const {lastUsedAt, scope, team} = template
  const {name: teamName} = team
  if (scope === 'TEAM') return lastUsedAt ? `Last used ${relativeDate(lastUsedAt)}` : 'Never used'
  return `Created by ${teamName}`
}

interface Props {
  isActive: boolean
  onClick: () => void
  template: ReflectTemplateItem_template
}

const ReflectTemplateItem = (props: Props) => {
  const {isActive, onClick, template} = props
  const {name: templateName} = template
  const description = makeDescription(template)
  return (
    <TemplateItem
      isActive={isActive}
      onClick={onClick}
    >
      <TemplateItemDetails>
        <TemplateTitle>{templateName}</TemplateTitle>
        <TemplateDescription>{description}</TemplateDescription>
      </TemplateItemDetails>
      <TemplateItemAction>
        <EditIcon>{'edit'}</EditIcon>
      </TemplateItemAction>
    </TemplateItem>
  )
}

export default createFragmentContainer(
  ReflectTemplateItem,
  {
    template: graphql`
      fragment ReflectTemplateItem_template on ReflectTemplate {
        #get the details here so we can show them in the details view
        ...ReflectTemplateDetails_template
        id
        name
        lastUsedAt
        scope
        team {
          name
        }
      }
    `
  }
)
