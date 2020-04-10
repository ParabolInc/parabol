import React from 'react'
import {TemplatePromptItem_prompt} from '../../../__generated__/TemplatePromptItem_prompt.graphql'
import styled from '@emotion/styled'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import useHover from '../../../hooks/useHover'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {PALETTE} from '../../../styles/paletteV2'
import PalettePicker from '../../../components/PalettePicker/PalettePicker'
import Icon from 'components/Icon'

interface Props {
  groupColor: string
  prompt: TemplatePromptItem_prompt
  prompts: any
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

export default EditableTemplatePromptColor
