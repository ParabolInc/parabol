import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {forwardRef, Ref} from 'react'
import {Input, InputProps} from '../../../ui/Input/Input'

export const DropdownMenuInputItem = forwardRef((props: InputProps, ref: Ref<HTMLInputElement>) => {
  const {onClick, onSelect, ...restProps} = props

  // We need to stop propagating events to radix to not trigger menu actions (space) or typeahead
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!['Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key)) {
      e.stopPropagation()
    }
  }

  const onInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    onClick?.(e)
    e.preventDefault()
  }

  const onInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    onSelect?.(e)
    e.preventDefault()
  }

  return (
    <DropdownMenu.Item asChild ref={ref}>
      <Input
        {...restProps}
        onKeyDownCapture={onInputKeyDown}
        onClick={onInputClick}
        onSelect={onInputSelect}
      />
    </DropdownMenu.Item>
  )
})
