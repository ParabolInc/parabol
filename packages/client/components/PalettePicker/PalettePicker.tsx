import React, {useEffect, useState} from 'react'
import {TemplatePromptItem_prompt} from '../../__generated__/TemplatePromptItem_prompt.graphql'
import PaletteColor from '../PaletteColor/PaletteColor'
import withAtmosphere, {WithAtmosphereProps} from '../../decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from '../../utils/relay/withMutationProps'
import ReflectTemplatePromptUpdateGroupColorMutation from '../../mutations/ReflectTemplatePromptUpdateGroupColorMutation'
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'

interface Props extends WithAtmosphereProps, WithMutationProps {
  prompt: TemplatePromptItem_prompt
  prompts: any
}

const PaletteDropDown = styled('div')({
  ...CreateCardRootStyles,
  border: 0,
  height: '160px',
  width: '214px',
  minWidth: '214px',
  padding: 5,
  position: 'absolute',
  zIndex: 1,
  top: 34
})

const PaletteList = styled('ul')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  listStyle: 'none',
  padding: 0
})

const PaletteItem = styled('div')({
  cursor: 'grab'
})

const Colors = [
  PALETTE.PROMPT_RED,
  PALETTE.PROMPT_ORANGE,
  PALETTE.PROMPT_YELLOW,
  PALETTE.PROMPT_LIGHT_GREEN,
  PALETTE.PROMPT_GREEN,
  PALETTE.PROMPT_CYAN,
  PALETTE.PROMPT_LIGHT_BLUE,
  PALETTE.PROMPT_BLUE,
  PALETTE.PROMPT_PURPLE,
  PALETTE.PROMPT_VIOLET,
  PALETTE.PROMPT_FUCHSIA,
  PALETTE.PROMPT_PINK
]

const PalettePicker = (props: Props) => {
  const {prompt, prompts, atmosphere, onError, onCompleted, submitMutation} = props
  const [groupColor, setGroupColor] = useState(prompt.groupColor)
  const pickedColors = prompts.map((prompt) => prompt.groupColor) as string[]
  const availableColors = Colors.filter((color) => !pickedColors.includes(color)) as string[]

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
    <PaletteDropDown>
      <PaletteList>
        {Colors.map((color, id) => {
          return (
            <PaletteItem onClick={() => setGroupColor(color)} key={id}>
              <PaletteColor color={color} />
            </PaletteItem>
          )
        })}
      </PaletteList>
    </PaletteDropDown>
  )
}

export default withAtmosphere(withMutationProps(PalettePicker))
