import {forwardRef} from 'react'

const SlackPrivateChannelHint = forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} className='max-w-72 whitespace-normal px-4 py-1 text-fg-muted text-xs leading-5'>
    Don't see a private channel? In Slack, run{' '}
    <code className='rounded bg-surface-well px-1'>/invite @Parabol</code> in that channel, then
    reopen this list.
  </div>
))

export default SlackPrivateChannelHint
