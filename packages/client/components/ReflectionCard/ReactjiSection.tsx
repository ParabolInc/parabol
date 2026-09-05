import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {useFragment} from 'react-relay'
import type {ReactjiSection_reactjis$key} from '~/__generated__/ReactjiSection_reactjis.graphql'
import {Threshold} from '~/types/constEnums'
import {cn} from '~/ui/cn'
import AddReactjiButton from './AddReactjiButton'
import ReactjiCountWrapper from './ReactjiCountWrapper'
import type {ReactjiSize} from './reactjiSize'

interface Props {
  className?: string
  onToggle: (emojiId: string) => void
  reactjis: ReactjiSection_reactjis$key
  size?: ReactjiSize
}

const ReactjiSection = (props: Props) => {
  const {className, onToggle, reactjis: reactjisRef, size = 'sm'} = props
  const reactjis = useFragment(
    graphql`
      fragment ReactjiSection_reactjis on Reactji @relay(plural: true) {
        ...ReactjiCount_reactji
        id
        count
        isViewerReactji
      }
    `,
    reactjisRef
  )

  return (
    <div className={cn('flex flex-wrap items-start justify-start', className)}>
      <AnimatePresence initial={false}>
        {reactjis.map((reactji) => (
          <ReactjiCountWrapper
            key={reactji.id}
            reactjiRef={reactji}
            onToggle={onToggle}
            size={size}
          />
        ))}
      </AnimatePresence>
      {reactjis.length <= Threshold.MAX_REACTJIS - 1 && (
        <AddReactjiButton onToggle={onToggle} size={size} />
      )}
    </div>
  )
}

export default ReactjiSection
