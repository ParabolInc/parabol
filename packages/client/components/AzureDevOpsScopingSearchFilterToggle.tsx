import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {FilterList} from '~/ui/icons'
import type {AzureDevOpsScopingSearchFilterToggle_meeting$key} from '../__generated__/AzureDevOpsScopingSearchFilterToggle_meeting.graphql'
import AzureDevOpsScopingSearchFilterMenu from './AzureDevOpsScopingSearchFilterMenu'
import FlatButton from './FlatButton'

interface Props {
  meeting: AzureDevOpsScopingSearchFilterToggle_meeting$key
}

const AzureDevOpsScopingSearchFilterToggle = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment AzureDevOpsScopingSearchFilterToggle_meeting on PokerMeeting {
        id
        ...AzureDevOpsScopingSearchFilterMenu_meeting
      }
    `,
    meetingRef
  )
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <FlatButton
        className='ml-1 h-6 w-6 bg-sky-500 p-0 hover:bg-sky-500'
        onClick={togglePortal}
        ref={originRef}
      >
        <FilterList className='h-[18px] w-[18px] text-white' />
      </FlatButton>
      {menuPortal(<AzureDevOpsScopingSearchFilterMenu meeting={meeting} menuProps={menuProps} />)}
    </>
  )
}

export default AzureDevOpsScopingSearchFilterToggle
