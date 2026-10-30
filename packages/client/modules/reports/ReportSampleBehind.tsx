import type {ReactNode} from 'react'

interface Props {
  sample: ReactNode
  // the prompt, centered over the sample, which grows to hold it when the sample is the shorter of the two
  children: ReactNode
  // a pinned card's prompt centers on the whole card, its nearest positioned ancestor, and the sample keeps the card
  // tall enough that the prompt clears its title
  isCompact?: boolean
}

// Before there's anything to report, made-up data shows what the report will look like, faded behind a prompt
const ReportSampleBehind = ({sample, children, isCompact = false}: Props) =>
  isCompact ? (
    <>
      <div
        inert
        aria-hidden
        className='flex min-h-48 select-none flex-col justify-center opacity-40'
      >
        {sample}
      </div>
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center p-4 *:pointer-events-auto'>
        {children}
      </div>
    </>
  ) : (
    <div className='grid grid-cols-1'>
      <div inert aria-hidden className='col-start-1 row-start-1 select-none self-center opacity-40'>
        {sample}
      </div>
      <div className='relative col-start-1 row-start-1 flex items-center justify-center'>
        {children}
      </div>
    </div>
  )

export default ReportSampleBehind
