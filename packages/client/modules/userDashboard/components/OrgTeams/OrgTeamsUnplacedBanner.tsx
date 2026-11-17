import {Check, Warning} from '~/ui/icons'

interface Props {
  unplacedCount: number
  isShowingUnplaced: boolean
  onToggle: () => void
}

const OrgTeamsUnplacedBanner = ({unplacedCount, isShowingUnplaced, onToggle}: Props) => (
  <div className='flex flex-wrap items-center gap-x-3 gap-y-2 border-hairline border-t bg-gold-100 px-4 py-2.5 text-gold-900 dark:bg-gold-900 dark:text-gold-100'>
    <Warning className='shrink-0 text-[20px] text-gold-700 dark:text-gold-300' />
    <span className='min-w-0 flex-[1_1_240px] font-medium text-sm'>
      {unplacedCount === 1 ? '1 team isn’t' : `${unplacedCount} teams aren’t`} placed in every level
      yet. Reports list {unplacedCount === 1 ? 'it' : 'them'} under “Not set” until{' '}
      {unplacedCount === 1 ? 'it is' : 'they are'}.
    </span>
    <button
      type='button'
      aria-pressed={isShowingUnplaced}
      onClick={onToggle}
      className='inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-current px-2.5 font-semibold text-xs hover:bg-gold-200 aria-pressed:bg-gold-200 aria-pressed:pl-1.5 dark:aria-pressed:bg-gold-800 dark:hover:bg-gold-800'
    >
      {isShowingUnplaced && <Check className='text-[16px]' />}
      Show only those
    </button>
  </div>
)

export default OrgTeamsUnplacedBanner
