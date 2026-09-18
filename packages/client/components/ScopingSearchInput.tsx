import type * as React from 'react'
import {useEffect, useRef} from 'react'
import {Close} from '~/ui/icons'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useScopingSearchState from '../hooks/useScopingSearchState'
import {cn} from '../ui/cn'
import SendClientSideEvent from '../utils/SendClientSideEvent'

interface Props {
  placeholder: string
  queryString: string
  meetingId: string
  service: TaskServiceEnum
  defaultInput?: string
}

const ScopingSearchInput = (props: Props) => {
  const {placeholder, queryString, meetingId, defaultInput, service} = props
  const atmosphere = useAtmosphere()
  const setSearchState = useScopingSearchState(meetingId, service)
  const inputRef = useRef<HTMLInputElement>(null)
  const isEmpty = !queryString

  useEffect(() => {
    if (defaultInput) {
      setSearchState({queryString: defaultInput})
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
    setSearchState({queryString: value})
    if (isEmpty) {
      trackEvent('Started Poker Scope Search')
    }
  }
  const clearSearch = () => {
    setSearchState({queryString: ''})
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
