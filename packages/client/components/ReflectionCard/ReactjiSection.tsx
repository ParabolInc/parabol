import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useInitialRender from '~/hooks/useInitialRender'
import useTransition, {TransitionStatus} from '~/hooks/useTransition'
import {Threshold} from '~/types/constEnums'
import {ReactjiSection_reactjis} from '~/__generated__/ReactjiSection_reactjis.graphql'
import AddReactjiButton from './AddReactjiButton'
import ReactjiCount from './ReactjiCount'

const Wrapper = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'wrap',
  justifyItems: 'center',
  justifyContent: 'start'
})

interface Props {
  className?: string
  onToggle: (emojiId: string) => void
  reactjis: ReactjiSection_reactjis
}

const ReactjiSection = (props: Props) => {
  const {className, onToggle, reactjis} = props
  const animatedReactjis = reactjis.map((reactji) => ({...reactji, key: reactji.id}))
  const tranChildren = useTransition(animatedReactjis)
  const isInit = useInitialRender()
  return (
    <Wrapper className={className}>
      {tranChildren.map((transReactji) => {
        return (
          <ReactjiCount
            key={transReactji.child.key}
            reactji={transReactji.child}
            onTransitionEnd={transReactji.onTransitionEnd}
            status={isInit ? TransitionStatus.ENTERED : transReactji.status}
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

export default createFragmentContainer(ReactjiSection, {
  reactjis: graphql`
    fragment ReactjiSection_reactjis on Reactji @relay(plural: true) {
      ...ReactjiCount_reactji
      id
      count
      isViewerReactji
    }
  `
})
