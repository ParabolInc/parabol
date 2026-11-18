import * as Collapsible from '@radix-ui/react-collapsible'
import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import {KeyboardArrowDown} from '~/ui/icons'
import type {RetroActionItems_meeting$key} from '../../../__generated__/RetroActionItems_meeting.graphql'
import useLocalStorageState from '../../../hooks/useLocalStorageState'
import RetroActionItemRow from './RetroActionItemRow'

interface Props {
  meetingRef: RetroActionItems_meeting$key | null | undefined
}

const RetroActionItems = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroActionItems_meeting on RetrospectiveMeeting {
        createdAt
        tasks {
          id
          plaintextContent
          status
          doneAt
          updatedAt
        }
      }
    `,
    meetingRef
  )
  const [isOpen, setIsOpen] = useLocalStorageState('Inspiration:retroActionItemsOpen', true)
  const tasks = (meeting?.tasks ?? []).filter(({plaintextContent}) => plaintextContent.trim())
  if (!meeting || tasks.length === 0) return null
  return (
    <Collapsible.Root asChild open={isOpen} onOpenChange={setIsOpen}>
      <section
        aria-labelledby='retro-action-items-heading'
        className='flex flex-col gap-1.5 px-4 pt-4'
      >
        <h3 id='retro-action-items-heading' className='m-0 font-semibold text-fg-primary text-sm'>
          <Collapsible.Trigger className='group flex w-full items-center justify-between gap-2 border-0 text-left'>
            <span>Last retro, the team agreed to</span>
            <span className='flex shrink-0 items-center gap-0.5 font-normal text-fg-muted text-xs'>
              {dayjs(meeting.createdAt).format('MMM D')} retro
              <KeyboardArrowDown className='size-5 transition-transform group-hover:text-fg-primary group-data-[state=open]:rotate-180' />
            </span>
          </Collapsible.Trigger>
        </h3>
        <Collapsible.Content asChild>
          <ul className='m-0 flex list-none flex-col rounded-lg border border-hairline p-0'>
            {tasks.map(({id, plaintextContent, status, doneAt, updatedAt}) => (
              <RetroActionItemRow
                key={id}
                text={plaintextContent}
                status={status}
                doneAt={doneAt}
                updatedAt={updatedAt}
              />
            ))}
          </ul>
        </Collapsible.Content>
      </section>
    </Collapsible.Root>
  )
}

export default RetroActionItems
