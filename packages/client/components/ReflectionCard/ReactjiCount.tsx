import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import PlainButton from 'components/PlainButton/PlainButton'
import data from 'emoji-mart/data/all.json'
import {uncompress} from 'emoji-mart/dist-modern/utils/data.js'
import {unifiedToNative} from 'emoji-mart/dist-modern/utils/index.js'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {ReactjiCount_reactji} from '__generated__/ReactjiCount_reactji.graphql'
import {TransitionStatus} from 'hooks/useTransition'
import {BezierCurve} from 'types/constEnums'
// import emojiIndex from 'emoji-mart/dist-modern/utils/emoji-index/emoji-index'

uncompress(data)

const Parent = styled('div')<{status: TransitionStatus}>(({status}) => ({
  height: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 28,
  maxWidth: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 68,
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  paddingLeft: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 2,
  paddingRight: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 2,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none'
}))

const Inner = styled(PlainButton)<{isViewerReactji: boolean}>(({isViewerReactji}) => ({
  background: isViewerReactji ? PALETTE.BACKGROUND_BLUE_LIGHT : '#fff',
  border: `1px solid ${isViewerReactji ? PALETTE.BORDER_BLUE : PALETTE.BORDER_GRAY}`,
  borderRadius: 24,
  fontSize: 16,
  padding: '0 8px',
  width: 'max-content'
}))

const Emoji = styled('span')({
  // IBM Plex has ugly emojis, don't use those
  fontFamily: 'sans-serif'
})

interface Props {
  reactji: ReactjiCount_reactji
  onToggle: (emojiId: string) => void
  onTransitionEnd: any
  status: TransitionStatus
}

const ReactjiCount = (props: Props) => {
  const {onToggle, reactji, status, onTransitionEnd} = props
  if (!reactji) return null
  const {count, id, isViewerReactji} = reactji
  const [, name] = id.split(':')
  const unified = data.emojis[name]?.unified ?? ''
  const unicode = unifiedToNative(unified) || ''
  const onClick = () => {
    onToggle(name)
  }
  return (
    <Parent onTransitionEnd={onTransitionEnd} status={status}>
      <Inner isViewerReactji={isViewerReactji} onClick={onClick}>
        <Emoji>{unicode}</Emoji>
        {count}
      </Inner>
    </Parent>
  )
}

export default createFragmentContainer(ReactjiCount, {
  reactji: graphql`
    fragment ReactjiCount_reactji on Reactji {
      id
      count
      isViewerReactji
    }
  `
})
