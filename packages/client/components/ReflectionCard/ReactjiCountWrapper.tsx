import {motion, usePresence} from 'motion/react'
import type {ReactjiCount_reactji$key} from '~/__generated__/ReactjiCount_reactji.graphql'
import ReactjiCount from './ReactjiCount'
import {REACTJI_CHIP_HEIGHT, REACTJI_CHIP_MAX_WIDTH, type ReactjiSize} from './reactjiSize'

interface Props {
  reactjiRef: ReactjiCount_reactji$key
  onToggle: (emojiId: string) => void
  size?: ReactjiSize
}

const ReactjiCountWrapper = ({reactjiRef, onToggle, size = 'sm'}: Props) => {
  const [isPresent, safeToRemove] = usePresence()

  return (
    <motion.div
      initial={{height: 0, maxWidth: 0, opacity: 0, paddingRight: 0}}
      animate={
        isPresent
          ? {
              height: REACTJI_CHIP_HEIGHT[size],
              maxWidth: REACTJI_CHIP_MAX_WIDTH[size],
              opacity: 1,
              paddingRight: 12
            }
          : {height: 0, maxWidth: 0, opacity: 0, paddingRight: 0}
      }
      transition={{duration: 0.25, ease: 'easeIn'}}
      style={{overflow: 'hidden', userSelect: 'none'}}
      onAnimationComplete={isPresent ? undefined : safeToRemove}
    >
      {isPresent && <ReactjiCount reactjiRef={reactjiRef} onToggle={onToggle} size={size} />}
    </motion.div>
  )
}

export default ReactjiCountWrapper
