import {Menu} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {DashTopBar_query$key} from '~/__generated__/DashTopBar_query.graphql'
import parabolLogo from '../styles/theme/images/brand/lockup_color_mark_white_type.svg'
import PinnedSnackbarNotifications from './PinnedSnackbarNotifications'
import PlainButton from './PlainButton/PlainButton'
import TopBarAvatar from './TopBarAvatar'
import TopBarHelp from './TopBarHelp'
import TopBarNotifications from './TopBarNotifications'
import TopBarSearch from './TopBarSearch'

interface Props {
  toggle: () => void
  queryRef: DashTopBar_query$key
}

const DashTopBar = (props: Props) => {
  const {toggle, queryRef} = props
  const data = useFragment(
    graphql`
      fragment DashTopBar_query on Query {
        ...TopBarNotifications_query
        ...PinnedSnackbarNotifications_query
        viewer {
          ...TopBarAvatar_viewer
          ...TopBarSearch_viewer
          picture
        }
      }
    `,
    queryRef
  )
  const navigate = useNavigate()
  const gotoHome = () => {
    navigate('/meetings')
  }
  return (
    <div className='flex h-14 w-full justify-between bg-surface-topbar dashboard-widest:pr-64 print:hidden'>
      <div className='flex w-64 shrink-0 items-center text-fg-topbar'>
        <PlainButton
          onClick={toggle}
          aria-label='Toggle dashboard menu'
          className='m-3 rounded-md p-1 text-[24px] leading-4 focus:shadow-[0_0_0_2px_var(--color-sky-400)]'
        >
          <Menu />
        </PlainButton>
        <button
          type='button'
          onClick={gotoHome}
          className='-ml-2 my-2 mr-0 cursor-pointer rounded border-none bg-transparent px-2 pt-2 pb-1 focus:shadow-[0_0_0_2px_var(--color-sky-400)] focus:outline-none'
        >
          <img crossOrigin='' src={parabolLogo} alt='Parabol logo' />
        </button>
      </div>
      <div className='dashboard-widest:mx-auto flex h-14 w-full dashboard-widest:max-w-[1360px] flex-1 items-center justify-between'>
        <TopBarSearch viewer={data.viewer} />
        <div className='flex max-w-[560px] items-center justify-end pr-4 text-fg-topbar'>
          <TopBarHelp />
          <TopBarNotifications queryRef={data} />
          <PinnedSnackbarNotifications queryRef={data} />
          <TopBarAvatar viewer={data.viewer || null} />
        </div>
      </div>
    </div>
  )
}

export default DashTopBar
