import type {RefObject} from 'react'
import type {ScopePhaseTabLayout} from './layoutScopePhaseTabs'
import type ScopePhaseTab from './ScopePhaseTab'
import ScopePhaseTabLabel from './ScopePhaseTabLabel'
import ScopePhaseTabMenu from './ScopePhaseTabMenu'
import ScopePhaseTabMenuTrigger from './ScopePhaseTabMenuTrigger'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

interface Props {
  allTabs: readonly ScopePhaseTab[]
  barRef: RefObject<HTMLDivElement | null>
  measureRef: RefObject<HTMLDivElement | null>
  layout: ScopePhaseTabLayout<ScopePhaseTab> | null
  onSelect: (key: string) => void
  onPick: (key: string) => void
}

const ignoreClick = () => {}

const ScopePhaseTabBar = (props: Props) => {
  const {allTabs, barRef, measureRef, layout, onSelect, onPick} = props
  return (
    <div className='relative flex border-hairline border-b border-solid' ref={barRef}>
      <div
        aria-hidden
        className='invisible absolute top-0 left-0 flex h-0 w-max overflow-hidden'
        ref={measureRef}
      >
        {allTabs.map((tab) => (
          <div className='flex-none' data-scope-tab={tab.key} key={tab.key}>
            <Tab label={<ScopePhaseTabLabel tab={tab} />} onClick={ignoreClick} />
          </div>
        ))}
        <div className='flex-none' data-scope-trigger>
          <ScopePhaseTabMenuTrigger moreCount={allTabs.length} />
        </div>
      </div>
      {layout && (
        <>
          <Tabs
            activeIdx={layout.barTabs.findIndex(({key}) => key === layout.activeKey)}
            className='min-w-0 flex-1'
          >
            {layout.barTabs.map((tab) => (
              <Tab
                className={
                  tab.key === layout.shortenedKey
                    ? 'min-w-0 shrink [&>div>div]:min-w-0 [&>div]:min-w-0'
                    : 'flex-none'
                }
                key={tab.key}
                label={<ScopePhaseTabLabel tab={tab} />}
                onClick={() => onSelect(tab.key)}
              />
            ))}
          </Tabs>
          {layout.menuTabs.length > 0 && (
            <ScopePhaseTabMenu tabs={layout.menuTabs} onPick={onPick} />
          )}
        </>
      )}
    </div>
  )
}

export default ScopePhaseTabBar
