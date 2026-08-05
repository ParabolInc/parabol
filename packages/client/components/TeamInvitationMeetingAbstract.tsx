import type {ReactNode} from 'react'
import {cn} from '../ui/cn'

const pageContainerClasses =
  'relative flex h-full max-h-full max-w-full flex-col items-center bg-slate-200 text-slate-700'

const navItemLabelClasses = 'h-[14px] w-[120px] rounded-[14px] bg-slate-600'

interface Props {
  children: ReactNode
}

const NavItem = () => (
  <div className='mb-[18px] flex items-center pl-6'>
    <div className='mr-3 h-6 w-6 rounded-[24px] bg-grape-700' />
    <div className={navItemLabelClasses} />
  </div>
)

function TeamInvitationMeetingAbstract(props: Props) {
  const {children} = props
  return (
    <div className={pageContainerClasses}>
      <div className='z-[3] flex w-full max-w-full flex-1 flex-col items-center justify-center px-4 py-8'>
        {children}
      </div>
      <div className='absolute top-0 bottom-0 left-0 z-[2] h-full w-screen bg-slate-700/30' />
      <div
        className={cn(
          pageContainerClasses,
          'absolute top-0 left-0 z-[1] min-w-[100vw] flex-row items-start blur-[2px]'
        )}
      >
        <div className='hidden h-full w-60 shrink-0 bg-white sm:block'>
          <div className='mt-[21px] mb-[35px] ml-[60px] h-[14px] w-[120px] rounded-[14px] bg-slate-700' />
          <div className='mb-[30px] ml-[60px] h-2 w-40 rounded-lg bg-slate-400' />
          <NavItem />
          <NavItem />
          <NavItem />
          <NavItem />
          <NavItem />
        </div>
        <div className='flex min-h-14 max-w-[100vw] flex-1 items-center justify-between px-5'>
          <div className={navItemLabelClasses} />
          <div className='flex shrink-0'>
            <div className='ml-2 h-8 w-8 rounded-[32px] bg-gold-300' />
            <div className='ml-2 h-8 w-8 rounded-[32px] bg-gold-300' />
            <div className='ml-2 h-8 w-8 rounded-[32px] bg-gold-300' />
            <div className='ml-2 h-8 w-8 rounded-[32px] bg-gold-300' />
            <div className='ml-2 h-8 w-8 rounded-[32px] bg-gold-300' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamInvitationMeetingAbstract
