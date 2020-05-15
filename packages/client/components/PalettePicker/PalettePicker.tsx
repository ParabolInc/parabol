import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PalettePicker_prompt} from '~/__generated__/PalettePicker_prompt.graphql'
import {PalettePicker_prompts} from '~/__generated__/PalettePicker_prompts.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {MenuProps} from '../../hooks/useMenu'
import useMutationProps from '../../hooks/useMutationProps'
import ReflectTemplatePromptUpdateGroupColorMutation from '../../mutations/ReflectTemplatePromptUpdateGroupColorMutation'
import palettePickerOptions from '../../styles/palettePickerOptions'
import Menu from '../Menu'
import PaletteColor from '../PaletteColor/PaletteColor'

interface Props {
  prompt: PalettePicker_prompt
  prompts: PalettePicker_prompts
  menuProps: MenuProps
}

const PaletteDropDown = styled(Menu)({
  width: '214px',
  minWidth: '214px',
  padding: 5
})

const PaletteList = styled('ul')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  listStyle: 'none',
  padding: 0,
  margin: 0
})

const PalettePicker = (props: Props) => {
  const {prompt, prompts, menuProps} = props
  const {id: promptId, groupColor} = prompt
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting} = useMutationProps()
  const allTakenColors = prompts.map((prompt) => prompt.groupColor)
  const handleClick = (color: string) => {
    if (submitting) return
    submitMutation()
    ReflectTemplatePromptUpdateGroupColorMutation(atmosphere, {promptId, groupColor: color})
    menuProps.closePortal()
  }

  return (
    <PaletteDropDown ariaLabel='Pick a group color' {...menuProps}>
      <PaletteList>
        {palettePickerOptions.map((color) => {
          return (
            <PaletteColor
              key={color.hex}
              color={color}
              isAvailable={!allTakenColors.includes(color.hex)}
              isCurrentColor={groupColor === color.hex}
              handleClick={handleClick}
            />
          )
        })}
      </PaletteList>
    </PaletteDropDown>
  )
}

export default createFragmentContainer(PalettePicker, {
  prompts: graphql`
    fragment PalettePicker_prompts on RetroPhaseItem @relay(plural: true) {
      id
      groupColor
    }
  `,
  prompt: graphql`
    fragment PalettePicker_prompt on RetroPhaseItem {
      id
      groupColor
    }
  `
})
