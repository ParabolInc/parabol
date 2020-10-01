import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV2'
import {JiraScopingSearchInput_meeting} from '../__generated__/JiraScopingSearchInput_meeting.graphql'
import Icon from './Icon'

const SearchInput = styled('input')({
  appearance: 'none',
  border: '1px solid transparent',
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  margin: 0,
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
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  padding: 12,
  visibility: isEmpty ? 'hidden' : undefined
}))

const setSearch = (atmosphere: Atmosphere, meetingId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    console.log('meet', meeting)
    if (!meeting) return
    meeting.setValue(value, 'jiraSearchQuery')
  })
}

interface Props {
  meeting: JiraScopingSearchInput_meeting
}

const JiraScopingSearchInput = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, jiraSearchQuery} = meeting
  const isEmpty = !jiraSearchQuery
  const atmosphere = useAtmosphere()
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(atmosphere, meetingId, e.target.value)
  }
  const clearSearch = () => {
    setSearch(atmosphere, meetingId, '')
  }
  return (
    <Wrapper>
      <SearchInput value={jiraSearchQuery || ''} placeholder={'Search issues on Jira'} onChange={onChange} />
      <ClearSearchIcon isEmpty={isEmpty} onClick={clearSearch}>close</ClearSearchIcon>
    </Wrapper>
  )
}

export default createFragmentContainer(JiraScopingSearchInput, {
  meeting: graphql`
    fragment JiraScopingSearchInput_meeting on PokerMeeting {
      id
      jiraSearchQuery
    }
  `
})
