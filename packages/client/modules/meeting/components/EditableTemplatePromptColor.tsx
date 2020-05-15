import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '~/components/Icon'
import {EditableTemplatePromptColor_prompt} from '~/__generated__/EditableTemplatePromptColor_prompt.graphql'
import {EditableTemplatePromptColor_prompts} from '~/__generated__/EditableTemplatePromptColor_prompts.graphql'
import PalettePicker from '../../../components/PalettePicker/PalettePicker'
import {MenuPosition} from '../../../hooks/useCoords'
import useHover from '../../../hooks/useHover'
import useMenu from '../../../hooks/useMenu'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'

interface Props {
  groupColor: string
  prompt: EditableTemplatePromptColor_prompt
  prompts: EditableTemplatePromptColor_prompts
}

interface StyledProps {
  groupColor?: string
  isHover?: boolean
}

const PromptColor = styled('div')<StyledProps>(({isHover}) => ({
  cursor: isHover ? 'pointer' : 'grab',
  display: 'flex',
  flex: 1,
  padding: '14px 0 5px'
}))

const ColorBadge = styled('div')<StyledProps>(({groupColor}) => ({
  backgroundColor: groupColor,
  borderRadius: '50%',
  height: '16px',
  width: '16px'
}))

const DropdownIcon = styled(Icon)<StyledProps>(({isHover}) => ({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18,
  marginRight: 8,
  opacity: isHover ? 1 : 0
}))

const EditableTemplatePromptColor = (props: Props) => {
  const {groupColor, prompt, prompts} = props
  const [hoverRef, isHover] = useHover<HTMLElement>()
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_LEFT,
    {parentId: 'portal'}
  )
  return (
    <div ref={hoverRef}>
      <PromptColor ref={originRef} isHover={isHover} onClick={togglePortal}>
        <ColorBadge groupColor={groupColor} />
        <DropdownIcon isHover={isHover}>arrow_drop_down</DropdownIcon>
        {menuPortal(<PalettePicker menuProps={menuProps} prompt={prompt} prompts={prompts} />)}
      </PromptColor>
    </div>
  )
}

export default createFragmentContainer(EditableTemplatePromptColor, {
  prompts: graphql`
    fragment EditableTemplatePromptColor_prompts on RetroPhaseItem @relay(plural: true) {
      ...PalettePicker_prompts
    }
  `,
  prompt: graphql`
    fragment EditableTemplatePromptColor_prompt on RetroPhaseItem {
      ...PalettePicker_prompt
    }
  `
})
