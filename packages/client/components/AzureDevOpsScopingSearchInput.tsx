import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {Close} from '~/ui/icons'
import type {AzureDevOpsScopingSearchInput_meeting$key} from '../__generated__/AzureDevOpsScopingSearchInput_meeting.graphql'
import type Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import {cn} from '../ui/cn'

const setSearch = (atmosphere: Atmosphere, meetingId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    if (!meeting) return
    const azureDevOpsSearchQuery = meeting.getLinkedRecord('azureDevOpsSearchQuery')!
    azureDevOpsSearchQuery.setValue(value, 'queryString')
  })
}

interface Props {
  meeting: AzureDevOpsScopingSearchInput_meeting$key
}

const AzureDevOpsScopingSearchInput = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment AzureDevOpsScopingSearchInput_meeting on PokerMeeting {
        id
        azureDevOpsSearchQuery {
          queryString
          isWIQL
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, azureDevOpsSearchQuery} = meeting
  const {isWIQL, queryString} = azureDevOpsSearchQuery
  const isEmpty = !queryString
  const atmosphere = useAtmosphere()
  const placeholder = isWIQL
    ? `[System.WorkItemType] = 'User Story' AND [System.State] <> 'Closed'`
    : 'Search issues on Azure DevOps'
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(atmosphere, meetingId, e.target.value)
  }
  const clearSearch = () => setSearch(atmosphere, meetingId, '')
  return (
    <div className='flex flex-1 items-center'>
      <input
        className='m-0 w-full appearance-none border border-transparent bg-transparent text-[16px] text-fg-primary outline-none'
        value={queryString!}
        placeholder={placeholder}
        onChange={onChange}
      />
      <Close
        className={cn('m-3 cursor-pointer text-fg-secondary', isEmpty && 'invisible')}
        onClick={clearSearch}
      />
    </div>
  )
}

export default AzureDevOpsScopingSearchInput
