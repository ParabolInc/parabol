import {Avatar, AvatarFallback, AvatarImage} from 'parabol-client'

const FACE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230D6EBB'/%3E%3Cstop offset='1' stop-color='%2393EBFC'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='96' height='96' fill='url(%23g)'/%3E%3Ccircle cx='48' cy='38' r='18' fill='white' fill-opacity='0.9'/%3E%3Crect x='20' y='60' width='56' height='40' rx='28' fill='white' fill-opacity='0.9'/%3E%3C/svg%3E"

export const WithImage = () => (
  <Avatar className='h-12 w-12'>
    <AvatarImage src={FACE} alt='Jordan Husney' />
    <AvatarFallback className='bg-slate-300 font-semibold text-slate-700'>JH</AvatarFallback>
  </Avatar>
)

export const Fallbacks = () => (
  <div className='flex items-center gap-3'>
    <Avatar className='h-12 w-12'>
      <AvatarFallback className='bg-sky-500 font-semibold text-white'>JH</AvatarFallback>
    </Avatar>
    <Avatar className='h-12 w-12'>
      <AvatarFallback className='bg-grape-600 font-semibold text-white'>AK</AvatarFallback>
    </Avatar>
    <Avatar className='h-12 w-12'>
      <AvatarFallback className='bg-aqua-400 font-semibold text-white'>MP</AvatarFallback>
    </Avatar>
  </div>
)

export const TeamStack = () => (
  <div className='flex'>
    {['JH', 'AK', 'MP', 'RL'].map((initials, i) => (
      <Avatar
        key={initials}
        className={`h-10 w-10 ring-2 ring-white ${i > 0 ? '-ml-3' : ''}`}
      >
        <AvatarFallback className='bg-slate-500 font-semibold text-white text-sm'>
          {initials}
        </AvatarFallback>
      </Avatar>
    ))}
  </div>
)
