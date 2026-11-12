import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Menu} from '~/ui/icons'
import type {MobileDashTopBar_query$key} from '../__generated__/MobileDashTopBar_query.graphql'
import type {ReportsLaunchGlowState} from '../hooks/useReportsLaunchGlow'
import PlainButton from './PlainButton/PlainButton'
import ReportsLaunchMenuGlow from './ReportsLaunchMenuGlow'
import TopBarHelp from './TopBarHelp'
//import TopBarIcon from './TopBarIcon'
import TopBarNotifications from './TopBarNotifications'

interface Props {
  toggle: () => void
  reportsGlow: ReportsLaunchGlowState
  queryRef: MobileDashTopBar_query$key
}

const MobileDashTopBar = (props: Props) => {
  const {toggle, reportsGlow, queryRef} = props
  const data = useFragment(
    graphql`
      fragment MobileDashTopBar_query on Query {
        ...TopBarNotifications_query
        viewer {
          pageName
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const pageName = viewer?.pageName ?? 'Parabol'
  return (
    <div className='flex h-14 max-w-full bg-surface-topbar print:hidden'>
      <div className='flex min-w-0 flex-1 items-center text-fg-topbar'>
        <PlainButton
          onClick={toggle}
          aria-label={
            reportsGlow === 'glowing'
              ? 'Toggle dashboard menu. New: Reports'
              : 'Toggle dashboard menu'
          }
          className='relative isolate pl-4 text-[24px] leading-4'
        >
          {reportsGlow !== 'off' && (
            <ReportsLaunchMenuGlow
              retiring={reportsGlow === 'retiring'}
              className='-inset-y-1 -right-1 left-3'
            />
          )}
          <Menu />
        </PlainButton>
        <div className='overflow-hidden text-ellipsis whitespace-nowrap pl-4 text-[20px]'>
          {pageName}
        </div>
      </div>
      <div className='flex max-w-[560px] items-center justify-end pr-4 text-fg-topbar'>
        {/* Disable search in mobile for now
            <TopBarIcon icon={'search'} ariaLabel={'Search'} /> */}
        <TopBarHelp />
        <TopBarNotifications queryRef={data || null} />
      </div>
    </div>
  )
}

export default MobileDashTopBar
