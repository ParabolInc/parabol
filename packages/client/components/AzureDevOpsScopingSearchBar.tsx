import {Search} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {AzureDevOpsScopingSearchBar_meeting$key} from '../__generated__/AzureDevOpsScopingSearchBar_meeting.graphql'
import AzureDevOpsScopingSearchFilterToggle from './AzureDevOpsScopingSearchFilterToggle'
import AzureDevOpsScopingSearchInput from './AzureDevOpsScopingSearchInput'

interface Props {
  meetingRef: AzureDevOpsScopingSearchBar_meeting$key
}

const AzureDevOpsScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment AzureDevOpsScopingSearchBar_meeting on PokerMeeting {
        ...AzureDevOpsScopingSearchInput_meeting
        ...AzureDevOpsScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )
  return (
    <div className='p-4'>
      <div className='flex h-11 w-full items-center rounded border border-hairline-field px-4'>
        <Search className='m-[3px] mr-[15px] text-fg-secondary' />
        <AzureDevOpsScopingSearchInput meeting={meeting} />
        <AzureDevOpsScopingSearchFilterToggle meeting={meeting} />
      </div>
    </div>
  )
}

export default AzureDevOpsScopingSearchBar
