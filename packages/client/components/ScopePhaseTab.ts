import type {ReactNode} from 'react'
import type {ScopePhaseLayoutTab} from './layoutScopePhaseTabs'

interface ScopePhaseTab extends ScopePhaseLayoutTab {
  icon: ReactNode
  keywords: readonly string[]
  menuStatus: 'connected' | 'contactUs' | null
  renderPanel: () => ReactNode
}

export default ScopePhaseTab
