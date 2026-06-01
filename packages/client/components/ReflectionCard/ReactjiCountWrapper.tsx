import {motion, usePresence} from 'motion/react'
import type {ReactjiCount_reactji$key} from '~/__generated__/ReactjiCount_reactji.graphql'
import ReactjiCount from './ReactjiCount'

interface Props {
  reactjiRef: ReactjiCount_reactji$key
  onToggle: (emojiId: string) => void
}

const ReactjiCountWrapper = ({reactjiRef, onToggle}: Props) => {
  const [isPresent, safeToRemove] = usePresence()

  return (
    <motion.div
      initial={{height: 0, maxWidth: 0, opacity: 0, paddingRight: 0}}
      animate={
        isPresent
          ? {height: 24, maxWidth: 68, opacity: 1, paddingRight: 12}
          : {height: 0, maxWidth: 0, opacity: 0, paddingRight: 0}
      }
      transition={{duration: 0.25, ease: 'easeIn'}}
      style={{overflow: 'hidden', userSelect: 'none'}}
      onAnimationComplete={isPresent ? undefined : safeToRemove}
    >
      {isPresent && <ReactjiCount reactjiRef={reactjiRef} onToggle={onToggle} />}
    </motion.div>
  )
}

export default ReactjiCountWrapper
