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
  height: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 24,
  maxWidth: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 68,
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  paddingLeft: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 0,
  paddingRight: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 8,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none'
}))

const Inner = styled(PlainButton)<{isViewerReactji: boolean}>(({isViewerReactji}) => ({
  alignItems: 'center',
  color: isViewerReactji ? PALETTE.TEXT_BLUE : PALETTE.TEXT_GRAY,
  display: 'flex',
  height: 24,
  lineHeight: '24px',
  width: 'max-content'
}))

const Emoji = styled('div')({
  // IBM Plex has ugly emojis, don't use those
  fontFamily: 'sans-serif',
  fontSize: 16,
  height: 24,
  lineHeight: '24px'
})

const Count = styled('div')({
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 600,
  height: 24,
  lineHeight: '24px',
  paddingLeft: 2
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
        <Count>{count}</Count>
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
