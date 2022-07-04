import styled from '@emotion/styled'
import React, {useEffect, useRef} from 'react'
import {commitLocalUpdate} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {PALETTE} from '../styles/paletteV3'
import {IntegrationProviderServiceEnum} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import Icon from './Icon'

const SearchInput = styled('input')({
  appearance: 'none',
  border: 'none',
  borderLeft: `1px solid ${PALETTE.SLATE_400}`,
  color: PALETTE.SLATE_700,
  fontSize: 16,
  margin: 0,
  padding: 12,
  outline: 0,
  backgroundColor: 'transparent',
  width: '100%'
})

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1
})

const ClearSearchIcon = styled(Icon)<{isEmpty: boolean}>(({isEmpty}) => ({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  padding: 12,
  visibility: isEmpty ? 'hidden' : undefined
}))

interface Props {
  placeholder: string
  queryString: string
  meetingId: string
  linkedRecordName: string
  service: IntegrationProviderServiceEnum | 'PARABOL'
  defaultInput?: string
}

const ScopingSearchInput = (props: Props) => {
  const {placeholder, queryString, meetingId, linkedRecordName, defaultInput, service} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
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
    SendClientSegmentEventMutation(atmosphere, eventTitle, {
      viewerId,
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
    <Wrapper>
      <SearchInput
        value={queryString}
        placeholder={placeholder}
        onChange={handleOnChange}
        ref={inputRef}
      />
      <ClearSearchIcon isEmpty={isEmpty} onClick={clearSearch}>
        close
      </ClearSearchIcon>
    </Wrapper>
  )
}

export default ScopingSearchInput
