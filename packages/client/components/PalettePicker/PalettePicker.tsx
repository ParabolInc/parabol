import React, {useEffect, useState} from 'react'
import {TemplatePromptItem_prompt} from '../../__generated__/TemplatePromptItem_prompt.graphql'
import PaletteColor from '../PaletteColor/PaletteColor'
import Menu from '../Menu'
import {MenuProps} from '../../hooks/useMenu'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import ReflectTemplatePromptUpdateGroupColorMutation from '../../mutations/ReflectTemplatePromptUpdateGroupColorMutation'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import {palettePickerOptions} from '../../styles/palettePickerOptions'

interface Props {
  prompt: TemplatePromptItem_prompt
  prompts: any
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

const PaletteItem = styled('div')()

const PalettePicker = (props: Props) => {
  const {prompt, prompts, menuProps} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation} = useMutationProps()
  const [groupColor, setGroupColor] = useState(prompt.groupColor)
  const pickedColors = prompts.map((prompt) => prompt.groupColor) as string[]
  const availableColors = palettePickerOptions.filter(
    (color) => !pickedColors.includes(color)
  ) as string[]

  const handleClick = (color: string) => {
    setGroupColor(color)
    menuProps.closePortal()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  const updateColor = (promptId: string, groupColor: string) => {
    submitMutation()
    ReflectTemplatePromptUpdateGroupColorMutation(
      atmosphere,
      {promptId, groupColor},
      {onError, onCompleted}
    )
  }

  useEffect(() => {
    const newColor = groupColor || PALETTE.PROMPT_GREEN
    if (pickedColors.includes(newColor)) {
      const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
      const promptToUpdate = prompts.find((prompt) => prompt.groupColor === newColor)
      promptToUpdate ? updateColor(promptToUpdate.id, randomColor) : null
    }
    updateColor(prompt.id, newColor)
  }, [groupColor])

  return (
    <PaletteDropDown ariaLabel='Pick a group color' {...menuProps}>
      <PaletteList>
        {palettePickerOptions.map((color, id) => {
          return (
            <PaletteItem onClick={() => handleClick(color)} key={id}>
              <PaletteColor
                color={color}
                isPicked={pickedColors.includes(color)}
                currentSelection={groupColor === color}
              />
            </PaletteItem>
          )
        })}
      </PaletteList>
    </PaletteDropDown>
  )
}

export default PalettePicker
