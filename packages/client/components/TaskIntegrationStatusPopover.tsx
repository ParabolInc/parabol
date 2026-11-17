import * as Popover from '@radix-ui/react-popover'
import {type ReactElement, useEffect, useId, useRef, useState} from 'react'
import {getClientIntegration, type TaskClientIntegration} from '../integrations/platform/registry'
import {cn} from '../ui/cn'
import OpenInNew from '../ui/icons/OpenInNew'

const OPEN_DELAY = 300
const CLOSE_DELAY = 150

interface Props {
  service: TaskClientIntegration
  href: string
  label: string
  status: string
  children: ReactElement
}

const TaskIntegrationStatusPopover = (props: Props) => {
  const {service, href, label, status, children} = props
  const {title, Icon, iconClassName} = getClientIntegration(service)
  const [open, setOpen] = useState(false)
  const timer = useRef<number>(undefined)
  const statusId = useId()
  const setOpenAfter = (nextOpen: boolean, delay: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(nextOpen), delay)
  }
  const show = () => setOpenAfter(true, OPEN_DELAY)
  const hide = () => setOpenAfter(false, CLOSE_DELAY)
  const keep = () => window.clearTimeout(timer.current)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor
        asChild
        aria-describedby={statusId}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={() => setOpenAfter(true, 0)}
        onBlur={() => setOpenAfter(false, 0)}
      >
        {children}
      </Popover.Anchor>
      <span id={statusId} className='sr-only'>{`Status in ${title}: ${status}`}</span>
      <Popover.Portal>
        <Popover.Content
          side='bottom'
          align='start'
          sideOffset={6}
          collisionPadding={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onMouseEnter={keep}
          onMouseLeave={hide}
          className='z-menu w-[260px] rounded-lg border border-hairline border-solid bg-surface-raised p-3 text-[13px] text-fg-primary leading-[18px] shadow-[var(--shadow-card-raised)] outline-hidden data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
        >
          <div className='flex items-center gap-2 font-semibold text-sm leading-5'>
            <span className={cn('flex size-4 shrink-0 [&_svg]:size-4', iconClassName)}>
              <Icon />
            </span>
            <span className='truncate'>{label}</span>
          </div>
          <div className='mt-2 flex justify-between gap-3 text-fg-secondary'>
            <span>{`Status in ${title}`}</span>
            <span className='text-right font-semibold text-fg-primary'>{status}</span>
          </div>
          <a
            href={href}
            rel='noopener noreferrer'
            target='_blank'
            tabIndex={-1}
            className='mt-2.5 inline-flex items-center gap-1 font-semibold text-accent-active no-underline hover:underline dark:text-fg-primary'
          >
            {`Open in ${title}`}
            <OpenInNew className='size-3.5' />
          </a>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default TaskIntegrationStatusPopover
