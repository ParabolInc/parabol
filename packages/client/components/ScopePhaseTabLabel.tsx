import type ScopePhaseTab from './ScopePhaseTab'

interface Props {
  tab: ScopePhaseTab
}

const ScopePhaseTabLabel = ({tab}: Props) => (
  <div className='flex min-w-20 items-center justify-center whitespace-nowrap'>
    <div className='mx-1 h-6 w-6 flex-none'>{tab.icon}</div>
    <span className='min-w-0 truncate'>{tab.title}</span>
  </div>
)

export default ScopePhaseTabLabel
