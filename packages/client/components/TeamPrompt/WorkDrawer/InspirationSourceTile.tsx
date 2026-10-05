import * as RadixPopover from '@radix-ui/react-popover'
import {useState} from 'react'
import {Check} from '~/ui/icons'
import type {InspirationSourcePopover_teamMember$key} from '../../../__generated__/InspirationSourcePopover_teamMember.graphql'
import {cn} from '../../../ui/cn'
import {NestedModalContext} from '../../../ui/Modal/NestedModalContext'
import Ellipsis from '../../Ellipsis/Ellipsis'
import InspirationSourceLogo from './InspirationSourceLogo'
import InspirationSourcePopover from './InspirationSourcePopover'
import {serviceLabel} from './inspirationCopy'
import type {InspirationSourceService, InspirationSourceSettings} from './inspirationSources'

interface Props {
  service: InspirationSourceService
  isConnected: boolean
  issueCount: number | undefined
  isCounting: boolean
  meetingId: string
  settings: InspirationSourceSettings
  setSettings: (update: (prev: InspirationSourceSettings) => InspirationSourceSettings) => void
  onClose: () => void
  teamMemberRef: InspirationSourcePopover_teamMember$key
}

const InspirationSourceTile = (props: Props) => {
  const {service, isConnected, issueCount, isCounting, settings, onClose} = props
  const [open, setOpen] = useState(false)
  const isIncluded = isConnected && settings.kinds[service].length > 0
  const label = serviceLabel(service)
  const status = !isConnected ? 'Connect' : isIncluded ? (issueCount ?? '–') : 'Off'
  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) onClose()
  }
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>
        <button
          type='button'
          aria-label={`${label}: ${isCounting ? 'counting items' : isIncluded ? 'in your draft' : isConnected ? 'off' : 'not connected'}. Settings`}
          className={cn(
            'relative flex h-16 w-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border bg-surface-card transition-colors hover:bg-surface-hover data-[state=open]:border-accent data-[state=open]:ring-1 data-[state=open]:ring-accent',
            isIncluded
              ? 'border-hairline-strong'
              : 'border-hairline-strong border-dashed bg-transparent'
          )}
        >
          <span
            className={cn('flex h-7 w-7 items-center justify-center', !isIncluded && 'opacity-40')}
          >
            <InspirationSourceLogo service={service} />
          </span>
          <span
            className={cn(
              'font-semibold text-[11px]',
              isIncluded ? 'text-fg-primary' : 'text-fg-muted'
            )}
          >
            {isCounting ? <Ellipsis /> : status}
          </span>
          {isIncluded && (
            <span className='-top-1.5 -right-1.5 absolute flex size-4 items-center justify-center rounded-full border-2 border-surface-well bg-accent text-white'>
              <Check className='size-2.5' />
            </span>
          )}
        </button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align='center'
          sideOffset={6}
          collisionPadding={8}
          className='z-30 rounded-lg border border-hairline bg-surface-modal shadow-xl'
        >
          <NestedModalContext.Provider value={true}>
            <InspirationSourcePopover {...props} />
          </NestedModalContext.Provider>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export default InspirationSourceTile
