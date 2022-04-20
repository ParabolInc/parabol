import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import Atmosphere from '~/Atmosphere'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import {GitLabScopingSearchInput_meeting$key} from '../__generated__/GitLabScopingSearchInput_meeting.graphql'
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

const setSearch = (atmosphere: Atmosphere, meetingId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    if (!meeting) return
    const gitlabSearchQuery = meeting.getLinkedRecord('gitlabSearchQuery')!
    gitlabSearchQuery.setValue(value, 'queryString')
  })
}

interface Props {
  meetingRef: GitLabScopingSearchInput_meeting$key
}

const GitLabScopingSearchInput = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchInput_meeting on PokerMeeting {
        id
        gitlabSearchQuery {
          queryString
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, gitlabSearchQuery} = meeting
  const {queryString} = gitlabSearchQuery
  const isEmpty = !queryString
  const atmosphere = useAtmosphere()
  const inputRef = useRef<HTMLInputElement>(null)
  const {viewerId} = atmosphere

  const trackEvent = (eventTitle: string) => {
    SendClientSegmentEventMutation(atmosphere, eventTitle, {
      viewerId,
      meetingId,
      service: 'gitlab'
    })
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    if (!queryString) {
      trackEvent('Started Poker Scope Search')
    }
    setSearch(atmosphere, meetingId, value)
  }

  const clearSearch = () => {
    trackEvent('Cleared Poker Scope Search')
    setSearch(atmosphere, meetingId, '')
    inputRef.current?.focus()
  }

  return (
    <Wrapper>
      <SearchInput
        autoFocus
        value={queryString}
        onChange={onChange}
        placeholder='Search GitLab issues...'
        ref={inputRef}
      />
      <ClearSearchIcon isEmpty={isEmpty} onClick={clearSearch}>
        close
      </ClearSearchIcon>
    </Wrapper>
  )
}

export default GitLabScopingSearchInput
