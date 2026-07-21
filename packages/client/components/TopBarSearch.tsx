import {Close, Search} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import {type Location, matchPath, useLocation} from 'react-router'
import {commitLocalUpdate} from 'relay-runtime'
import type {TopBarSearch_viewer$key} from '~/__generated__/TopBarSearch_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useSearchDialog} from '~/modules/search/SearchContext'
import {Input} from '~/ui/Input/Input'
import type Atmosphere from '../Atmosphere'
import {cn} from '../ui/cn'

const getShowSearch = (location: Location) => {
  const {pathname} = location
  return (
    pathname.includes('/me/tasks') ||
    !!matchPath('/team/:teamId', pathname) ||
    !!matchPath('/team/:teamId/archive', pathname) ||
    !!matchPath('/meetings', pathname)
  )
}
interface Props {
  viewer: TopBarSearch_viewer$key | null
}

const setSearch = (atmosphere: Atmosphere, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const viewer = store.getRoot().getLinkedRecord('viewer')
    if (!viewer) return
    viewer.setValue(value, 'dashSearch')
  })
}

const TopBarSearch = (props: Props) => {
  const {viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TopBarSearch_viewer on User {
        dashSearch
      }
    `,
    viewerRef
  )
  const dashSearch = viewer?.dashSearch ?? ''
  const inputRef = useRef<HTMLInputElement>(null)
  const atmosphere = useAtmosphere()
  const location = useLocation()
  const {openSearch} = useSearchDialog()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setSearch(atmosphere, value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      openSearch(dashSearch)
    }
  }

  const Icon = dashSearch ? Close : Search

  const onClick = () => {
    setSearch(atmosphere, '')
    inputRef.current?.focus()
  }

  return (
    <div
      className={cn(
        'm-2 flex h-10 max-w-[480px] flex-1 items-center rounded bg-search-bg',
        getShowSearch(location) ? 'visible' : 'invisible'
      )}
    >
      <Input
        ref={inputRef}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={'Search'}
        value={dashSearch}
        className='m-0 h-full w-full appearance-none border-transparent bg-transparent px-4 py-3 text-fg-topbar text-xl leading-6 outline-none placeholder:text-search-placeholder focus:outline-none focus-visible:border-transparent'
        maxLength={255}
      />
      <div className='m-3 h-6 w-6 cursor-pointer text-fg-topbar' onClick={onClick}>
        <Icon />
      </div>
    </div>
  )
}

export default TopBarSearch
