import {Close} from '@mui/icons-material'
import type * as React from 'react'
import {useEffect, useRef} from 'react'
import {commitLocalUpdate} from 'react-relay'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {cn} from '../ui/cn'
import SendClientSideEvent from '../utils/SendClientSideEvent'

interface Props {
  placeholder: string
  queryString: string
  meetingId: string
  linkedRecordName: string
  service: TaskServiceEnum
  defaultInput?: string
}

const ScopingSearchInput = (props: Props) => {
  const {placeholder, queryString, meetingId, linkedRecordName, defaultInput, service} = props
  const atmosphere = useAtmosphere()
  const inputRef = useRef<HTMLInputElement>(null)
  const isEmpty = !queryString

  const setSearch = (meetingId: string, value: string) => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const searchQuery = meeting.getLinkedRecord(linkedRecordName)!
      searchQuery.setValue(value, 'queryString')
    })
  }

  useEffect(() => {
    if (defaultInput) {
      setSearch(meetingId, defaultInput)
    }
  }, [])

  const trackEvent = (eventTitle: string) => {
    SendClientSideEvent(atmosphere, eventTitle, {
      meetingId,
      service
    })
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setSearch(meetingId, value)
    if (isEmpty) {
      trackEvent('Started Poker Scope Search')
    }
  }
  const clearSearch = () => {
    setSearch(meetingId, '')
    inputRef.current?.focus()
    trackEvent('Cleared Poker Scope Search')
  }

  return (
    <div className='flex flex-1 items-center'>
      <input
        className='m-0 w-full appearance-none border-hairline-strong border-l border-none bg-transparent p-3 text-base text-fg-primary outline-none placeholder:text-fg-muted'
        value={queryString}
        placeholder={placeholder}
        onChange={handleOnChange}
        ref={inputRef}
      />
      <Close
        className={cn('m-3 cursor-pointer text-fg-secondary', isEmpty && 'invisible')}
        onClick={clearSearch}
      />
    </div>
  )
}

export default ScopingSearchInput
