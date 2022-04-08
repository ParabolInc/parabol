import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import Atmosphere from '~/Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import {SprintPokerDefaults} from '../types/constEnums'
import {GitHubScopingSearchInput_meeting$key} from '../__generated__/GitHubScopingSearchInput_meeting.graphql'
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
    const githubSearchQuery = meeting.getLinkedRecord('githubSearchQuery')!
    githubSearchQuery.setValue(value, 'queryString')
  })
}

interface Props {
  meetingRef: GitHubScopingSearchInput_meeting$key
}

graphql`
  fragment GitHubScopingSearchInputGitHubIntegration on GitHubIntegration {
    githubSearchQueries {
      queryString
    }
  }
`

const GitHubScopingSearchInput = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchInput_meeting on PokerMeeting {
        id
        githubSearchQuery {
          queryString
        }
        viewerMeetingMember {
          teamMember {
            integrations {
              github {
                ...GitHubScopingSearchInputGitHubIntegration @relay(mask: false)
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, githubSearchQuery, viewerMeetingMember} = meeting
  const {teamMember} = viewerMeetingMember!
  const {integrations} = teamMember
  const {github} = integrations
  const {githubSearchQueries} = github!
  const defaultInput =
    githubSearchQueries?.[0]?.queryString ?? SprintPokerDefaults.GITHUB_DEFAULT_QUERY
  const {queryString} = githubSearchQuery
  const isEmpty = !queryString
  const atmosphere = useAtmosphere()
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    setSearch(atmosphere, meetingId, defaultInput)
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setSearch(atmosphere, meetingId, value)
  }
  const clearSearch = () => {
    setSearch(atmosphere, meetingId, '')
    inputRef.current?.focus()
  }

  return (
    <Wrapper>
      <SearchInput
        autoFocus
        value={queryString}
        onChange={onChange}
        placeholder={'Search GitHub issues...'}
        ref={inputRef}
      />
      <ClearSearchIcon isEmpty={isEmpty} onClick={clearSearch}>
        close
      </ClearSearchIcon>
    </Wrapper>
  )
}

export default GitHubScopingSearchInput
