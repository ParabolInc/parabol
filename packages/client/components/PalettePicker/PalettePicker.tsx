import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import ReflectTemplatePromptUpdateGroupColorMutation from '~/mutations/ReflectTemplatePromptUpdateGroupColorMutation'
import {PalettePicker_prompt$key} from '~/__generated__/PalettePicker_prompt.graphql'
import {PalettePicker_prompts$key} from '~/__generated__/PalettePicker_prompts.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {MenuProps} from '../../hooks/useMenu'
import palettePickerOptions from '../../styles/palettePickerOptions'
import Menu from '../Menu'
import PaletteColor from '../PaletteColor/PaletteColor'

interface Props {
  prompt: PalettePicker_prompt$key
  prompts: PalettePicker_prompts$key
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
  const {prompt: promptRef, prompts: promptsRef, menuProps} = props
  const prompts = useFragment(
    graphql`
      fragment PalettePicker_prompts on ReflectPrompt @relay(plural: true) {
        id
        groupColor
      }
    `,
    promptsRef
  )
  const prompt = useFragment(
    graphql`
      fragment PalettePicker_prompt on ReflectPrompt {
        id
        groupColor
      }
    `,
    promptRef
  )
  const {closePortal} = menuProps
  const {id: promptId, groupColor} = prompt
  const atmosphere = useAtmosphere()
  const allTakenColors = prompts.map((prompt) => prompt.groupColor)
  const handleClick = (color: string) => {
    ReflectTemplatePromptUpdateGroupColorMutation(atmosphere, {promptId, groupColor: color})
    closePortal()
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

export default PalettePicker
