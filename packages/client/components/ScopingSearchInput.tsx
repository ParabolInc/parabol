import styled from '@emotion/styled'
import React, {useRef} from 'react'
import {commitLocalUpdate} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
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
}

const ScopingSearchInput = (props: Props) => {
  const {placeholder, queryString, meetingId, linkedRecordName} = props
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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setSearch(meetingId, value)
  }
  const clearSearch = () => {
    setSearch(meetingId, '')
    inputRef.current?.focus()
  }

  return (
    <Wrapper>
      <SearchInput
        value={queryString}
        placeholder={placeholder}
        onChange={onChange}
        ref={inputRef}
      />
      <ClearSearchIcon isEmpty={isEmpty} onClick={clearSearch}>
        close
      </ClearSearchIcon>
    </Wrapper>
  )
}

export default ScopingSearchInput
