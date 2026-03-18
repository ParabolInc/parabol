import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReactjiSection_reactjis$key} from '~/__generated__/ReactjiSection_reactjis.graphql'
import useInitialRender from '~/hooks/useInitialRender'
import useTransition, {TransitionStatus} from '~/hooks/useTransition'
import {BezierCurve, Threshold} from '~/types/constEnums'
import AddReactjiButton from './AddReactjiButton'
import ReactjiCount from './ReactjiCount'

const Wrapper = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'wrap',
  justifyItems: 'center',
  justifyContent: 'start'
})

// Lightweight exit animation wrapper matching ReactjiCount's Parent collapse styles
const ExitingReactji = styled('div')({
  height: 0,
  maxWidth: 0,
  opacity: 0,
  paddingLeft: 0,
  paddingRight: 0,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none'
})

interface Props {
  className?: string
  onToggle: (emojiId: string) => void
  reactjis: ReactjiSection_reactjis$key
}

const ReactjiSection = (props: Props) => {
  const {className, onToggle, reactjis: reactjisRef} = props
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

  // Only pass keys to useTransition — never Relay fragment references
  const animatedKeys = reactjis.map((reactji) => ({key: reactji.id}))
  const tranChildren = useTransition(animatedKeys)
  const isInit = useInitialRender()

  // Build a lookup map so we always pass CURRENT fragment refs to ReactjiCount
  const reactjiById = new Map(reactjis.map((r) => [r.id, r]))

  return (
    <Wrapper className={className}>
      {tranChildren.map((transChild) => {
        const currentReactji = reactjiById.get(transChild.child.key as string)
        if (!currentReactji) {
          // Item is exiting and no longer in the Relay store — render a collapsing wrapper
          // instead of ReactjiCount which would call useFragment with a stale reference
          return (
            <ExitingReactji
              key={transChild.child.key}
              onTransitionEnd={transChild.onTransitionEnd}
            />
          )
        }
        return (
          <ReactjiCount
            key={transChild.child.key}
            reactjiRef={currentReactji}
            onTransitionEnd={transChild.onTransitionEnd}
            status={isInit ? TransitionStatus.ENTERED : transChild.status}
            onToggle={onToggle}
          />
        )
      })}
      {tranChildren.length <= Threshold.MAX_REACTJIS - 1 && (
        <AddReactjiButton onToggle={onToggle} />
      )}
    </Wrapper>
  )
}

export default ReactjiSection
