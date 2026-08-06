import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {PalettePicker_prompt$key} from '~/__generated__/PalettePicker_prompt.graphql'
import type {PalettePicker_prompts$key} from '~/__generated__/PalettePicker_prompts.graphql'
import ReflectTemplatePromptUpdateGroupColorMutation from '~/mutations/ReflectTemplatePromptUpdateGroupColorMutation'
import useAtmosphere from '../../hooks/useAtmosphere'
import type {MenuProps} from '../../hooks/useMenu'
import palettePickerOptions from '../../styles/palettePickerOptions'
import Menu from '../Menu'
import PaletteColor from '../PaletteColor/PaletteColor'

interface Props {
  prompt: PalettePicker_prompt$key
  prompts: PalettePicker_prompts$key
  menuProps: MenuProps
}

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
    ReflectTemplatePromptUpdateGroupColorMutation(atmosphere, {
      promptId,
      groupColor: color
    })
    closePortal()
  }

  return (
    <Menu className='w-[214px] min-w-[214px] p-[5px]' ariaLabel='Pick a group color' {...menuProps}>
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
    </Menu>
  )
}

export default PalettePicker
