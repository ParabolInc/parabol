import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {PalettePicker_prompt$key} from '~/__generated__/PalettePicker_prompt.graphql'
import type {PalettePicker_prompts$key} from '~/__generated__/PalettePicker_prompts.graphql'
import ReflectTemplatePromptUpdateGroupColorMutation from '~/mutations/ReflectTemplatePromptUpdateGroupColorMutation'
import useAtmosphere from '../../hooks/useAtmosphere'
import palettePickerOptions from '../../styles/palettePickerOptions'
import {MenuContent} from '../../ui/Menu/MenuContent'
import PaletteColor from '../PaletteColor/PaletteColor'

interface Props {
  prompt: PalettePicker_prompt$key
  prompts: PalettePicker_prompts$key
  onClose: () => void
}

const PalettePicker = (props: Props) => {
  const {prompt: promptRef, prompts: promptsRef, onClose} = props
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
  const {id: promptId, groupColor} = prompt
  const atmosphere = useAtmosphere()
  const allTakenColors = prompts.map((prompt) => prompt.groupColor)
  const handleClick = (color: string) => {
    ReflectTemplatePromptUpdateGroupColorMutation(atmosphere, {
      promptId,
      groupColor: color
    })
    onClose()
  }

  return (
    <MenuContent align='start' className='w-[214px] min-w-[214px] p-[5px]'>
      <ul className='m-0 flex list-none flex-wrap justify-center p-0'>
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
      </ul>
    </MenuContent>
  )
}

export default PalettePicker
