import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import React, {useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {commitLocalUpdate} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {PALETTE} from '../styles/paletteV3'
import {TaskServiceEnum} from '../__generated__/SendClientSegmentEventMutation.graphql'

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

const ClearSearchIcon = styled(Close)<{isEmpty: boolean}>(({isEmpty}) => ({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  margin: 12,
  visibility: isEmpty ? 'hidden' : undefined
}))

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

  const {t} = useTranslation()

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
    SendClientSegmentEventMutation(atmosphere, eventTitle, {
      meetingId,
      service
    })
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setSearch(meetingId, value)
    if (isEmpty) {
      trackEvent(t('ScopingSearchInput.StartedPokerScopeSearch'))
    }
  }
  const clearSearch = () => {
    setSearch(meetingId, '')
    inputRef.current?.focus()
    trackEvent(t('ScopingSearchInput.ClearedPokerScopeSearch'))
  }

  return (
    <Wrapper>
      <SearchInput
        value={queryString}
        placeholder={placeholder}
        onChange={handleOnChange}
        ref={inputRef}
      />
      <ClearSearchIcon isEmpty={isEmpty} onClick={clearSearch} />
    </Wrapper>
  )
}

export default ScopingSearchInput
