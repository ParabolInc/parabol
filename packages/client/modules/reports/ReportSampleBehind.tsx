import type {ReactNode} from 'react'

// React 18 doesn't type inert, which keeps the sample's controls out of reach of the mouse and keyboard
const INERT = {inert: ''}

interface Props {
  sample: ReactNode
  // the prompt, centered over the sample
  children: ReactNode
}

// Before there's anything to report, made-up data shows what the report will look like, faded behind a prompt
const ReportSampleBehind = ({sample, children}: Props) => (
  <div className='relative'>
    <div {...INERT} aria-hidden className='select-none opacity-40'>
      {sample}
    </div>
    <div className='absolute inset-0 flex items-center justify-center'>{children}</div>
  </div>
)

export default ReportSampleBehind
