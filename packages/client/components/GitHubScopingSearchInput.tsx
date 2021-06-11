import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import Atmosphere from '~/Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import {SprintPokerDefaults} from '../types/constEnums'
import {GitHubScopingSearchInput_meeting} from '../__generated__/GitHubScopingSearchInput_meeting.graphql'
import Icon from './Icon'

const SearchInput = styled('input')({
  appearance: 'none',
  border: 'none',
  color: PALETTE.SLATE_700,
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
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  padding: 12,
  visibility: isEmpty ? 'hidden' : undefined
}))

const setSearch = (atmosphere: Atmosphere, meetingId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    if (!meeting) return
    const githubSearchQuery = meeting.getLinkedRecord('githubSearchQuery')!
    githubSearchQuery.setValue(value, 'queryString')
  })
}

interface Props {
  meeting: GitHubScopingSearchInput_meeting
}

const GitHubScopingSearchInput = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, githubSearchQuery} = meeting
  const {queryString} = githubSearchQuery
  const isEmpty = !queryString
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const defaultInput = `${SprintPokerDefaults.GITHUB_DEFAULT_QUERY} `
    setSearch(atmosphere, meetingId, defaultInput)
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setSearch(atmosphere, meetingId, value)
  }
  const clearSearch = () => {
    setSearch(atmosphere, meetingId, '')
  }

  return (
    <Wrapper>
      <SearchInput autoFocus value={queryString} onChange={onChange} />
      <ClearSearchIcon isEmpty={isEmpty} onClick={clearSearch}>
        close
      </ClearSearchIcon>
    </Wrapper>
  )
}

export default createFragmentContainer(GitHubScopingSearchInput, {
  meeting: graphql`
    fragment GitHubScopingSearchInput_meeting on PokerMeeting {
      id
      githubSearchQuery {
        queryString
      }
    }
  `
})
