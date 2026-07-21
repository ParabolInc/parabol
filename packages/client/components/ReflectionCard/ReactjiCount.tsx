import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReactjiCount_reactji$key} from '~/__generated__/ReactjiCount_reactji.graphql'
import PlainButton from '~/components/PlainButton/PlainButton'
import {Times} from '~/types/constEnums'
import {MenuPosition} from '../../hooks/useCoords'
import useTooltip from '../../hooks/useTooltip'
import ReactjiId from '../../shared/gqlIds/ReactjiId'
import {cn} from '../../ui/cn'
import getReactji from '../../utils/getReactji'
import EmojiUsersReaction from './EmojiUsersReaction'

interface Props {
  reactjiRef: ReactjiCount_reactji$key
  onToggle: (emojiId: string) => void
}

const ReactjiCount = (props: Props) => {
  const {onToggle, reactjiRef} = props
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER,
    {
      delay: Times.SHOW_REACTJI_USERS_DELAY
    }
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
    <PlainButton
      className={cn(
        'flex h-6 w-max items-center rounded-full bg-surface-well px-1.5 leading-6',
        isViewerReactji ? 'text-accent' : 'text-fg-primary'
      )}
      onClick={onClick}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      ref={originRef}
    >
      {/* IBM Plex has ugly emojis, don't use those */}
      <div className='h-6 text-left font-sans text-base leading-6'>{native}</div>
      <div className='h-6 pl-1 font-semibold text-xs tabular-nums leading-6'>{count}</div>
      {tooltipPortal(<EmojiUsersReaction reactjiRef={reactji} reactjiName={reactjiName} />)}
    </PlainButton>
  )
}

export default ReactjiCount
