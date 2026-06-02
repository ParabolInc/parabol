import * as Popover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingAvatar_user$key} from '../../../../__generated__/NewMeetingAvatar_user.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import AvatarPopoverContent from './AvatarPopoverContent'
import MeetingAvatarCard from './MeetingAvatarCard'
import {useHoverPopover} from './useHoverPopover'

interface Props {
  userRef: NewMeetingAvatar_user$key
}

const NewMeetingAvatar = (props: Props) => {
  const {userRef} = props
  const {open, onOpenChange, hoverTriggerProps, hoverContentProps} = useHoverPopover()

  const user = useFragment(
    graphql`
      fragment NewMeetingAvatar_user on User {
        id
        picture
        preferredName
        email
      }
    `,
    userRef
  )

  const {email, preferredName, picture} = user
  return (
    <ErrorBoundary>
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          <div
            className='relative h-8 w-8 max-w-8 cursor-pointer rounded-full xl:h-12 xl:w-12 xl:max-w-12 min-[1600px]:h-14 min-[1600px]:w-14 min-[1600px]:max-w-14'
            {...hoverTriggerProps}
          >
            <Avatar picture={picture} alt={preferredName} className='h-full w-full' />
          </div>
        </Popover.Trigger>
        <AvatarPopoverContent open={open} {...hoverContentProps}>
          <MeetingAvatarCard picture={picture} preferredName={preferredName} email={email} />
        </AvatarPopoverContent>
      </Popover.Root>
    </ErrorBoundary>
  )
}

export default NewMeetingAvatar
