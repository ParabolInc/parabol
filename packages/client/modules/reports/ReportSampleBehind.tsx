import type {ReactNode} from 'react'

// React 18 doesn't type inert, which keeps the sample's controls out of reach of the mouse and keyboard
const INERT = {inert: ''}

interface Props {
  sample: ReactNode
  // the prompt, centered over the sample, which grows to hold it when the sample is the shorter of the two
  children: ReactNode
}

// Before there's anything to report, made-up data shows what the report will look like, faded behind a prompt
const ReportSampleBehind = ({sample, children}: Props) => (
  <div className='grid grid-cols-1'>
    <div
      {...INERT}
      aria-hidden
      className='col-start-1 row-start-1 select-none self-center opacity-40'
    >
      {sample}
    </div>
    <div className='relative col-start-1 row-start-1 flex items-center justify-center'>
      {children}
    </div>
  </div>
)

export default ReportSampleBehind
