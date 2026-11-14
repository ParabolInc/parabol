import type {Repo} from '~/hooks/useGetRepoContributions'
import useSearchFilter from '~/hooks/useSearchFilter'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  handleSelectNameWithOwner: (key: string) => void
  repos: Repo[]
  teamId: string
  userId: string
}

const getValue = (item: Repo) => item.nameWithOwner

const NewGitHubIssueMenu = (props: Props) => {
  const {handleSelectNameWithOwner, repos} = props

  const {
    query,
    filteredItems: filteredRepos,
    onQueryChange
  } = useSearchFilter(repos ?? [], getValue)

  return (
    <MenuContent align='start' className='min-w-[300px]'>
      <MenuSearch placeholder='Search GitHub' onChange={onQueryChange} value={query} />
      {query && filteredRepos.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No repos found!</EmptyDropdownMenuItemLabel>
      )}
      {filteredRepos.slice(0, 10).map((repo) => {
        const {nameWithOwner} = repo
        if (!nameWithOwner) return null
        const onClick = () => {
          handleSelectNameWithOwner(nameWithOwner)
        }
        return (
          <TaskIntegrationMenuItem
            key={nameWithOwner}
            query={query}
            label={nameWithOwner}
            onClick={onClick}
            service='github'
          />
        )
      })}
    </MenuContent>
  )
}

export default NewGitHubIssueMenu
