import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {EditableTemplatePromptColor_prompt$key} from '~/__generated__/EditableTemplatePromptColor_prompt.graphql'
import type {EditableTemplatePromptColor_prompts$key} from '~/__generated__/EditableTemplatePromptColor_prompts.graphql'
import PlainButton from '~/components/PlainButton/PlainButton'
import {ArrowDropDown as ArrowDropDownIcon} from '~/ui/icons'
import PalettePicker from '../../../components/PalettePicker/PalettePicker'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {cn} from '../../../ui/cn'

interface Props {
  isOwner: boolean
  prompt: EditableTemplatePromptColor_prompt$key
  prompts: EditableTemplatePromptColor_prompts$key
}

const EditableTemplatePromptColor = (props: Props) => {
  const {isOwner, prompt: promptRef, prompts: promptsRef} = props
  const prompts = useFragment(
    graphql`
      fragment EditableTemplatePromptColor_prompts on ReflectPrompt @relay(plural: true) {
        ...PalettePicker_prompts
      }
    `,
    promptsRef
  )
  const prompt = useFragment(
    graphql`
      fragment EditableTemplatePromptColor_prompt on ReflectPrompt {
        ...PalettePicker_prompt
        groupColor
      }
    `,
    promptRef
  )
  const {groupColor} = prompt
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_LEFT
  )
  return (
    <PlainButton
      ref={originRef}
      className={cn(
        'relative block h-6 w-6 flex-1 shrink-0 p-1',
        isOwner ? 'cursor-pointer' : 'cursor-default'
      )}
      onClick={isOwner ? togglePortal : undefined}
    >
      <div className='m-px h-3.5 w-3.5 rounded-full' style={{backgroundColor: groupColor}} />
      <div className='-right-1.5 absolute bottom-0 h-6 w-3 text-fg-secondary opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0,0,.2,1)] [&_svg]:text-[18px]'>
        <ArrowDropDownIcon />
      </div>
      {menuPortal(<PalettePicker menuProps={menuProps} prompt={prompt} prompts={prompts} />)}
    </PlainButton>
  )
}

export default EditableTemplatePromptColor
