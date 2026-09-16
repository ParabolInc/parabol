import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReactjiCount_reactji$key} from '~/__generated__/ReactjiCount_reactji.graphql'
import PlainButton from '~/components/PlainButton/PlainButton'
import {Times} from '~/types/constEnums'
import ReactjiId from '../../shared/gqlIds/ReactjiId'
import {cn} from '../../ui/cn'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import getReactji from '../../utils/getReactji'
import EmojiUsersReaction from './EmojiUsersReaction'

interface Props {
  reactjiRef: ReactjiCount_reactji$key
  onToggle: (emojiId: string) => void
}

const ReactjiCount = (props: Props) => {
  const {onToggle, reactjiRef} = props
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
    <Tooltip delayDuration={Times.SHOW_REACTJI_USERS_DELAY}>
      <TooltipTrigger asChild>
        <PlainButton
          className={cn(
            'flex h-6 w-max items-center rounded-md bg-surface-well px-1.5 leading-6',
            isViewerReactji ? 'text-accent' : 'text-fg-primary'
          )}
          onClick={onClick}
        >
          {/* IBM Plex has ugly emojis, don't use those */}
          <div className='h-6 text-left font-sans text-base leading-6'>{native}</div>
          <div className='h-6 pl-1 font-semibold text-xs tabular-nums leading-6'>{count}</div>
        </PlainButton>
      </TooltipTrigger>
      <TooltipContent side='bottom'>
        <EmojiUsersReaction reactjiRef={reactji} reactjiName={reactjiName} />
      </TooltipContent>
    </Tooltip>
  )
}

export default ReactjiCount
