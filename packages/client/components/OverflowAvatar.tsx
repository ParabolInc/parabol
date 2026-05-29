import {motion} from 'motion/react'
import {useRef} from 'react'
import useResizeFontForElement from '../hooks/useResizeFontForElement'

interface Props {
  offset: number
  overflowCount: number
  onClick?: () => void
  width: number
  borderColor?: string
}

const OverflowAvatar = (props: Props) => {
  const {overflowCount, offset, onClick, width, borderColor} = props
  const ref = useRef<HTMLDivElement>(null)
  const label = overflowCount >= 99 ? 99 : overflowCount
  useResizeFontForElement<HTMLDivElement>(ref, label, 11, 18, 4)
  return (
    <motion.div
      style={{position: 'absolute'}}
      initial={{x: offset, scale: 0, opacity: 0}}
      animate={{x: offset, scale: 1, opacity: 1}}
      exit={{scale: 0, opacity: 0}}
      transition={{duration: 0.3, ease: [0, 0, 0.2, 1]}}
      onClick={onClick}
    >
      <div
        ref={ref}
        className='flex select-none items-center justify-center overflow-hidden rounded-full bg-sky-400 font-semibold text-sm text-white'
        style={{width, height: width, border: `2px solid ${borderColor ?? '#fff'}`}}
      >
        {label}
      </div>
    </motion.div>
  )
}

export default OverflowAvatar
