import {Children, type ReactNode} from 'react'
import {cn} from '../../ui/cn'
import SwipeablePanel from '../SwipeablePanel'

interface Props {
  activeIdx: number
  children: ReactNode
  disabled?: boolean
  setActiveIdx: (number: number) => void
  focusedIdx?: number
}

const ReflectWrapperMobile = (props: Props) => {
  const {children, activeIdx, setActiveIdx, focusedIdx, disabled} = props
  const childArr = Children.toArray(children)
  return (
    <>
      <SwipeablePanel
        index={activeIdx}
        onChangeIndex={(idx) => setActiveIdx(idx)}
        disabled={disabled}
        style={{width: '100%', padding: '0 16px', height: '100%'}}
        slideClassName='px-1'
      >
        {children}
      </SwipeablePanel>
      <div className='flex items-center py-2'>
        {childArr.map((_, idx) => {
          const isLocal = idx === activeIdx
          const isFocused = idx === focusedIdx
          return (
            <div
              key={idx}
              className={cn(
                'mx-0.5 h-2 w-2 cursor-pointer rounded-full',
                isLocal ? 'bg-accent-active' : isFocused ? 'bg-rose-500' : 'bg-fg-muted opacity-35'
              )}
              onClick={() => setActiveIdx(idx)}
            />
          )
        })}
      </div>
    </>
  )
}

export default ReflectWrapperMobile
