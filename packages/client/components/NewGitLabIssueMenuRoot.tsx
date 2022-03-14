import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {MenuProps} from '~/hooks/useMenu'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import newGitLabIssueMenuQuery, {
  NewGitLabIssueMenuQuery
} from '../__generated__/NewGitLabIssueMenuQuery.graphql'
import {NewGitLabIssueMenuRoot$key} from '../__generated__/NewGitLabIssueMenuRoot.graphql'
import GitLabScopingSearchResults from './GitLabScopingSearchResults'
import NewGitLabIssueMenu from './NewGitLabIssueMenu'

interface Props {
  meetingRef: NewGitLabIssueMenuRoot$key
  handleSelectFullPath: (key: string) => void
  menuProps: MenuProps
  // repoIntegrations: NewGitLabIssueMenu_repoIntegrations
  teamId: string
  userId: string
}

const NewGitLabIssueMenuRoot = (props: Props) => {
  const {meetingRef} = props
  const {handleSelectFullPath, menuProps, teamId, userId} = props
  // const {teamId, gitlabSearchQuery} = meeting
  // const {teamId} = meeting
  // const {queryString} = gitlabSearchQuery
  // const normalizedQueryString = queryString.trim()
  const queryRef = useQueryLoaderNow<NewGitLabIssueMenuQuery>(newGitLabIssueMenuQuery, {teamId})
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <NewGitLabIssueMenu
          handleSelectFullPath={handleSelectFullPath}
          menuProps={menuProps}
          // repoIntegrations={repoIntegrations}
          teamId={teamId}
          userId={userId}
          queryRef={queryRef}
        />
      )}
    </Suspense>
  )
}

export default NewGitLabIssueMenuRoot
