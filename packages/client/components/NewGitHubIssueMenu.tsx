import React from 'react'
import {useTranslation} from 'react-i18next'
import {Repo} from '~/hooks/useGetRepoContributions'
import {MenuProps} from '~/hooks/useMenu'
import useSearchFilter from '~/hooks/useSearchFilter'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  handleSelectNameWithOwner: (key: string) => void
  menuProps: MenuProps
  repos: Repo[]
  teamId: string
  userId: string
}

const getValue = (item: Repo) => item.nameWithOwner

const NewGitHubIssueMenu = (props: Props) => {
  const {handleSelectNameWithOwner, menuProps, repos} = props

  const {t} = useTranslation()

  const {
    query,
    filteredItems: filteredRepos,
    onQueryChange
  } = useSearchFilter(repos ?? [], getValue)

  return (
    <Menu
      ariaLabel={t('NewGitHubIssueMenu.SelectGitHubProject')}
      keepParentFocus
      {...menuProps}
      resetActiveOnChanges={[filteredRepos]}
    >
      <SearchMenuItem
        placeholder={t('NewGitHubIssueMenu.SearchGitHub')}
        onChange={onQueryChange}
        value={query}
      />
      {query && filteredRepos.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          {t('NewGitHubIssueMenu.NoReposFound')}
        </EmptyDropdownMenuItemLabel>
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
    </Menu>
  )
}

export default NewGitHubIssueMenu
