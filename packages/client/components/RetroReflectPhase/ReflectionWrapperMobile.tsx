import {Children, type ReactNode} from 'react'
import {PALETTE} from '../../styles/paletteV3'
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
              className='mx-0.5 h-2 w-2 cursor-pointer rounded-full'
              style={{
                backgroundColor: isLocal
                  ? PALETTE.GRAPE_700
                  : isFocused
                    ? PALETTE.ROSE_500
                    : PALETTE.SLATE_600,
                opacity: isLocal ? undefined : isFocused ? undefined : 0.35
              }}
              onClick={() => setActiveIdx(idx)}
            />
          )
        })}
      </div>
    </>
  )
}

export default ReflectWrapperMobile
