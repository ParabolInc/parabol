import type {CSSProperties, ReactNode} from 'react'
import {cn} from '../../ui/cn'
import LabelHeading from '../LabelHeading/LabelHeading'

interface Props {
  children: ReactNode
  className?: string
  controls?: ReactNode
  label?: string
  casing?: CSSProperties['textTransform']
}

const CASING_CLASS = {
  capitalize: 'capitalize',
  lowercase: 'lowercase',
  none: 'normal-case'
} as Partial<Record<NonNullable<CSSProperties['textTransform']>, string>>

const Panel = (props: Props) => {
  const {children, className, controls, label, casing} = props
  return (
    <div
      className={cn(
        'relative my-4 w-full rounded bg-surface-card text-sm leading-5 shadow-card',
        className
      )}
    >
      {label && (
        <div className='flex w-full items-center'>
          <LabelHeading className={cn('px-4 py-2', casing && CASING_CLASS[casing])}>
            {label}
          </LabelHeading>
          <div className='flex h-11 flex-1 justify-end px-4 leading-[44px]'>{controls}</div>
        </div>
      )}
      <div className='block w-full'>{children}</div>
    </div>
  )
}

export default Panel
