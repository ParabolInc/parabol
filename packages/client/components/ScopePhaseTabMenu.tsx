import {useState} from 'react'
import {Menu} from '../ui/Menu/Menu'
import type ScopePhaseTab from './ScopePhaseTab'
import ScopePhaseTabMenuContent from './ScopePhaseTabMenuContent'
import ScopePhaseTabMenuTrigger from './ScopePhaseTabMenuTrigger'

interface Props {
  tabs: readonly ScopePhaseTab[]
  onPick: (key: string) => void
}

const ScopePhaseTabMenu = ({tabs, onPick}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const pickAndClose = (key: string) => {
    setIsOpen(false)
    onPick(key)
  }
  return (
    <Menu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={<ScopePhaseTabMenuTrigger moreCount={tabs.length} />}
    >
      <ScopePhaseTabMenuContent tabs={tabs} onPick={pickAndClose} />
    </Menu>
  )
}

export default ScopePhaseTabMenu
