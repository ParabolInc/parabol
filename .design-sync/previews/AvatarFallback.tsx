import {Avatar, AvatarFallback} from 'parabol-client'

export const Composed = () => (
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
