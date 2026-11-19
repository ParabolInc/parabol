import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {InspirationSourceFilterQuery} from '../../../__generated__/InspirationSourceFilterQuery.graphql'
import AzureDevOpsProjectFilterBar from './AzureDevOpsProjectFilterBar'
import ClickUpListFilterBar from './ClickUpListFilterBar'
import GitHubRepoFilterBar from './GitHubRepoFilterBar'
import type {InspirationFilterService} from './InspirationSourceFilterRoot'
import type {InspirationSourceSettings} from './inspirationSources'
import JiraProjectFilterBar from './JiraProjectFilterBar'
import LinearProjectFilterBar from './LinearProjectFilterBar'

interface Props {
  service: InspirationFilterService
  settings: InspirationSourceSettings
  setSettings: (update: (prev: InspirationSourceSettings) => InspirationSourceSettings) => void
  queryRef: PreloadedQuery<InspirationSourceFilterQuery>
}

const InspirationSourceFilter = (props: Props) => {
  const {service, settings, setSettings, queryRef} = props
  const data = usePreloadedQuery<InspirationSourceFilterQuery>(
    graphql`
      query InspirationSourceFilterQuery(
        $teamId: ID!
        $isGitHub: Boolean!
        $isJira: Boolean!
        $isLinear: Boolean!
        $isAzureDevOps: Boolean!
        $isClickUp: Boolean!
      ) {
        viewer {
          teamMember(teamId: $teamId) {
            ...GitHubRepoFilterBar_teamMember @include(if: $isGitHub)
            ...JiraProjectFilterBar_teamMember @include(if: $isJira)
            ...LinearProjectFilterBar_teamMember @include(if: $isLinear)
            ...AzureDevOpsProjectFilterBar_teamMember @include(if: $isAzureDevOps)
            ...ClickUpListFilterBar_teamMember @include(if: $isClickUp)
          }
        }
      }
    `,
    queryRef
  )
  const {teamMember} = data.viewer
  if (!teamMember) return null
  switch (service) {
    case 'github':
      return (
        <GitHubRepoFilterBar
          teamMemberRef={teamMember}
          selectedRepos={settings.githubRepos}
          setSelectedRepos={(githubRepos) => setSettings((prev) => ({...prev, githubRepos}))}
        />
      )
    case 'jira':
      return (
        <JiraProjectFilterBar
          teamMemberRef={teamMember}
          selectedProjectIds={settings.jiraProjectIds}
          setSelectedProjectIds={(jiraProjectIds) =>
            setSettings((prev) => ({...prev, jiraProjectIds}))
          }
        />
      )
    case 'linear':
      return (
        <LinearProjectFilterBar
          className='m-0'
          teamMemberRef={teamMember}
          selectedLinearIds={settings.linearIds}
          setSelectedLinearIds={(linearIds) => setSettings((prev) => ({...prev, linearIds}))}
        />
      )
    case 'azureDevOps':
      return (
        <AzureDevOpsProjectFilterBar
          teamMemberRef={teamMember}
          selectedProjectIds={settings.azureDevOpsProjectIds}
          setSelectedProjectIds={(azureDevOpsProjectIds) =>
            setSettings((prev) => ({...prev, azureDevOpsProjectIds}))
          }
        />
      )
    case 'clickup':
      return (
        <ClickUpListFilterBar
          teamMemberRef={teamMember}
          selectedListIds={settings.clickupListIds}
          setSelectedListIds={(clickupListIds) =>
            setSettings((prev) => ({...prev, clickupListIds}))
          }
        />
      )
  }
}

export default InspirationSourceFilter
