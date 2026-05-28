import * as Popover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {MeetingOverflowMenu_users$key} from '../../../../__generated__/MeetingOverflowMenu_users.graphql'
import AvatarPopoverContent from './AvatarPopoverContent'
import MeetingAvatarCard from './MeetingAvatarCard'
import {useHoverPopover} from './useHoverPopover'

interface Props {
  hiddenMembers: MeetingOverflowMenu_users$key
}

const MeetingOverflowMenu = ({hiddenMembers}: Props) => {
  const {open, onOpenChange, hoverTriggerProps, hoverContentProps} = useHoverPopover()

  const users = useFragment(
    graphql`
      fragment MeetingOverflowMenu_users on User @relay(plural: true) {
        id
        picture
        preferredName
        email
      }
    `,
    hiddenMembers
  )

  const count = users.length
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          className='flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded-full bg-sky-400 font-semibold text-md text-white xl:h-12 xl:w-12 min-[1600px]:h-14 min-[1600px]:w-14 min-[1600px]:text-base'
          aria-label={`${count} more participants`}
          {...hoverTriggerProps}
        >
          {`+${count}`}
        </button>
      </Popover.Trigger>
      <AvatarPopoverContent open={open} className='max-h-60 overflow-y-auto' {...hoverContentProps}>
        {users.map(({id, picture, preferredName, email}) => (
          <MeetingAvatarCard
            key={id}
            picture={picture}
            preferredName={preferredName}
            email={email}
          />
        ))}
      </AvatarPopoverContent>
    </Popover.Root>
  )
}

export default MeetingOverflowMenu
