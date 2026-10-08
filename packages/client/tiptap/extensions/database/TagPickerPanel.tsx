import type {UseAutocompleteReturnValue} from '@mui/base/useAutocomplete'
import * as Popover from '@radix-ui/react-popover'
import {Check as CheckIcon} from '~/ui/icons'
import {Tag} from './Tag'

export type TagOption = {
  inputValue?: string
  value: string
}

type Props = Pick<
  UseAutocompleteReturnValue<TagOption, boolean, false, true>,
  | 'getRootProps'
  | 'getInputProps'
  | 'getListboxProps'
  | 'getOptionProps'
  | 'groupedOptions'
  | 'setAnchorEl'
>

export const TagPickerPanel = (props: Props) => {
  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    setAnchorEl
  } = props
  const options = groupedOptions as TagOption[]
  return (
    <Popover.Content
      align='start'
      sideOffset={4}
      collisionPadding={8}
      className='z-10 w-64 rounded-md bg-surface-modal text-fg-primary text-sm shadow-[var(--shadow-card-raised)] outline-hidden data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
    >
      <div {...getRootProps()} className='p-2'>
        <div ref={setAnchorEl}>
          <input
            {...getInputProps()}
            placeholder='Search or create…'
            className='block h-8 w-full rounded-sm border border-hairline-field bg-surface-input px-2 pointer-coarse:text-base text-sm outline-none focus:border-accent'
          />
        </div>
      </div>
      <ul {...getListboxProps()} className='m-0 max-h-56 list-none overflow-y-auto px-1 pt-0 pb-1'>
        {options.map((option, index) => (
          <li
            {...getOptionProps({option, index})}
            key={option.value}
            className='group flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 [&.Mui-focused]:bg-surface-hover'
          >
            {option.inputValue && <span className='shrink-0 text-fg-secondary'>Create</span>}
            <Tag label={option.value} />
            <CheckIcon className='ml-auto hidden shrink-0 text-[18px] text-fg-secondary group-aria-selected:block' />
          </li>
        ))}
      </ul>
      {options.length === 0 && (
        <div className='px-3 pb-3 text-fg-muted text-xs'>Type to create an option</div>
      )}
    </Popover.Content>
  )
}
