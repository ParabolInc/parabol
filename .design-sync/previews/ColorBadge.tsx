import {ColorBadge} from 'parabol-client'

// Identity Relay stub: the `reflection` ref is the fragment $data directly.
// ColorBadge is a small colored corner drop; we mount it inside a relative card
// so the absolute-positioned badge is visible in its natural top-left corner.
const Card = ({color, question}: {color: string; question: string}) => (
  <div className='relative h-28 w-64 rounded-card bg-white shadow-card'>
    <ColorBadge phaseType={'group'} reflection={{prompt: {question, groupColor: color}}} />
    <div className='px-4 pt-5 text-slate-700 text-sm'>
      Shipped the new onboarding flow ahead of schedule
    </div>
  </div>
)

export const StartColumn = () => <Card color='#66B04E' question='What went well?' />

export const StopColumn = () => <Card color='#E55C5C' question='What should we stop doing?' />

export const ContinueColumn = () => <Card color='#4C9EE7' question='What should we continue?' />
