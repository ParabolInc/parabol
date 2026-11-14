import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {forwardRef, Ref} from 'react'
import {cn} from '../../../ui/cn'
import {Input, InputProps} from '../../../ui/Input/Input'

export const DropdownMenuInputItem = forwardRef((props: InputProps, ref: Ref<HTMLInputElement>) => {
  const {onClick, onSelect, className, ...restProps} = props

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
        className={cn('h-8 bg-surface-input pointer-coarse:text-base', className)}
        onKeyDownCapture={onInputKeyDown}
        onClick={onInputClick}
        onSelect={onInputSelect}
      />
    </DropdownMenu.Item>
  )
})
