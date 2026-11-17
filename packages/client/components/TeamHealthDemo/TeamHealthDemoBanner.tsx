import {useState} from 'react'
import {Info} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'
import TeamHealthDemoCtaDialog from './TeamHealthDemoCtaDialog'

const TeamHealthDemoBanner = () => {
  const [isCtaOpen, setIsCtaOpen] = useState(false)
  return (
    <div
      role='note'
      className='flex shrink-0 items-center gap-3 border-gold-500 border-b bg-gold-100 px-4 py-2 text-gold-900 dark:border-gold-400 dark:bg-gold-900 dark:text-gold-100'
    >
      <Info className='size-5 shrink-0' />
      <p className='m-0 min-w-0 flex-1 text-sm leading-5'>
        <span className='font-bold uppercase tracking-wide'>Sample data</span>
        <span className='sm:hidden'> · Made-up team, nothing saved.</span>
        <span className='max-sm:hidden'>
          {' '}
          · This team and its scores are made up to show what Team Health looks like after 5 checks.
          Nothing you do here is saved.
        </span>
      </p>
      <Button variant='primary' size='sm' onClick={() => setIsCtaOpen(true)}>
        <span className='sm:hidden'>Get started</span>
        <span className='max-sm:hidden'>Ready for real results?</span>
      </Button>
      <TeamHealthDemoCtaDialog isOpen={isCtaOpen} onClose={() => setIsCtaOpen(false)} />
    </div>
  )
}

export default TeamHealthDemoBanner
