import {ThreadedAvatarColumn} from 'parabol-client'

export const Comment = () => (
  <div className='flex items-start bg-slate-100 p-3'>
    <ThreadedAvatarColumn isReply={false} picture={null} />
    <div className='rounded-lg bg-white p-3 text-slate-700 text-sm shadow'>
      Nice work landing the launch on time!
    </div>
  </div>
)

export const Reply = () => (
  <div className='flex items-start bg-slate-100 p-3'>
    <ThreadedAvatarColumn isReply picture={null} />
    <div className='rounded-lg bg-white p-3 text-slate-700 text-sm shadow'>
      Agreed — the whole team pulled together.
    </div>
  </div>
)
