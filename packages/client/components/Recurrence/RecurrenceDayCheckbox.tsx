import {
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type Ref
} from 'react'
import {cn} from '../../ui/cn'
import type {Day} from '../../utils/humanReadableRecurrenceRule'

export const CheckboxRoot = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return <div {...rest} ref={ref} className={cn('relative h-[46px] w-[46px]', className)} />
  }
)

export const StyledCheckbox = forwardRef(
  (props: InputHTMLAttributes<HTMLInputElement>, ref: Ref<HTMLInputElement>) => {
    const {className, ...rest} = props
    return (
      <input
        {...rest}
        ref={ref}
        className={cn(
          'absolute inset-0 m-0 appearance-none rounded-lg border border-hairline-field checked:border-sky-500 checked:bg-sky-500 hover:rounded hover:outline-1 hover:outline-fg-secondary focus:rounded focus:outline-1 focus:outline-fg-secondary active:rounded active:outline-1 active:outline-fg-secondary',
          className
        )}
      />
    )
  }
)

export const StyledCheckboxLabel = forwardRef(
  (
    props: LabelHTMLAttributes<HTMLLabelElement> & {isChecked: boolean},
    ref: Ref<HTMLLabelElement>
  ) => {
    const {className, isChecked, ...rest} = props
    return (
      <label
        {...rest}
        ref={ref}
        className={cn(
          'absolute inset-0 flex cursor-pointer items-center justify-center font-semibold text-[20px] leading-[26px]',
          isChecked ? 'text-white' : 'text-fg-primary',
          className
        )}
      />
    )
  }
)

export interface Props {
  day: Day
  isChecked: boolean
  onToggle: (day: Day) => void
}

export const RecurrenceDayCheckbox = (props: Props) => {
  const {day, onToggle, isChecked} = props
  const toggle = () => {
    onToggle(day)
  }

  return (
    <CheckboxRoot>
      <StyledCheckbox
        type='checkbox'
        id={day.name}
        name={day.abbreviation}
        checked={isChecked}
        onChange={toggle}
      />
      <StyledCheckboxLabel htmlFor={day.name} isChecked={isChecked}>
        {day.abbreviation}
      </StyledCheckboxLabel>
    </CheckboxRoot>
  )
}
