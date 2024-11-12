import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ReactjiCount_reactji$key} from '~/__generated__/ReactjiCount_reactji.graphql'
import PlainButton from '~/components/PlainButton/PlainButton'
import {TransitionStatus} from '~/hooks/useTransition'
import {PALETTE} from '~/styles/paletteV3'
import {BezierCurve, Times} from '~/types/constEnums'
import {MenuPosition} from '../../hooks/useCoords'
import useTooltip from '../../hooks/useTooltip'
import ReactjiId from '../../shared/gqlIds/ReactjiId'
import getReactji from '../../utils/getReactji'
import EmojiUsersReaction from './EmojiUsersReaction'

const Parent = styled('div')<{status: TransitionStatus}>(({status}) => ({
  height: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 24,
  maxWidth: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 68,
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  paddingLeft: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 0,
  paddingRight: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 12,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none'
}))

const Inner = styled(PlainButton)<{isViewerReactji: boolean}>(({isViewerReactji}) => ({
  alignItems: 'center',
  color: isViewerReactji ? PALETTE.SKY_500 : PALETTE.SLATE_600,
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
  lineHeight: '24px',
  textAlign: 'left'
})

const Count = styled('div')({
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 600,
  height: 24,
  lineHeight: '24px',
  paddingLeft: 4
})

interface Props {
  reactjiRef: ReactjiCount_reactji$key
  onToggle: (emojiId: string) => void
  onTransitionEnd: any
  status: TransitionStatus
}

const ReactjiCount = (props: Props) => {
  const {onToggle, reactjiRef, status, onTransitionEnd} = props
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER,
    {delay: Times.SHOW_REACTJI_USERS_DELAY}
  )
  const reactji = useFragment(
    graphql`
      fragment ReactjiCount_reactji on Reactji {
        id
        count
        isViewerReactji
        ...EmojiUsersReaction_reactji
      }
    `,
    reactjiRef
  )

  if (!reactji) return null
  const {count, id, isViewerReactji} = reactji
  const reactjiObj = ReactjiId.split(id)
  const name = reactjiObj.name

  const {native, reactjiName} = getReactji(name)
  const onClick = () => {
    onToggle(name)
  }

  return (
    <Parent onTransitionEnd={onTransitionEnd} status={status}>
      <Inner
        isViewerReactji={isViewerReactji}
        onClick={onClick}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        ref={originRef}
      >
        <Emoji>{native}</Emoji>
        <Count>{count}</Count>
        {tooltipPortal(<EmojiUsersReaction reactjiRef={reactji} reactjiName={reactjiName} />)}
      </Inner>
    </Parent>
  )
}

export default ReactjiCount
