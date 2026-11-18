import type {ReactNode} from 'react'

interface Props {
  heading: string
  children: ReactNode
}

const RetroSettingsSection = ({heading, children}: Props) => (
  <section aria-label={heading} className='flex flex-col pb-3'>
    <h3 className='m-0 px-1 pt-4 pb-1 font-semibold text-[11px] text-fg-muted uppercase leading-4 tracking-wider'>
      {heading}
    </h3>
    <div className='flex flex-col divide-y divide-hairline'>{children}</div>
  </section>
)

export default RetroSettingsSection
