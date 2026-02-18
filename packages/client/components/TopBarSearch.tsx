import styled from '@emotion/styled'
import {Close, Search} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import {matchPath, type RouteProps} from 'react-router'
import {commitLocalUpdate} from 'relay-runtime'
import type {TopBarSearch_viewer$key} from '~/__generated__/TopBarSearch_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useRouter from '~/hooks/useRouter'
import {useSearchDialog} from '~/modules/search/SearchContext'
import {Input} from '~/ui/Input/Input'
import type Atmosphere from '../Atmosphere'

const getShowSearch = (location: NonNullable<RouteProps['location']>) => {
  const {pathname} = location
  return (
    pathname.includes('/me/tasks') ||
    !!matchPath(pathname, {
      path: '/team/:teamId',
      exact: true,
      strict: false
    }) ||
    !!matchPath(pathname, {
      path: '/team/:teamId/archive',
      exact: true,
      strict: false
    }) ||
    !!matchPath(pathname, {
      path: '/meetings',
      exact: true,
      strict: false
    })
  )
}
interface Props {
  viewer: TopBarSearch_viewer$key | null
}

const Wrapper = styled('div')<{location: NonNullable<RouteProps['location']>}>(({location}) => ({
  alignItems: 'center',
  backgroundColor: 'hsla(0,0%,100%,.125)',
  borderRadius: 4,
  display: 'flex',
  flex: 1,
  height: 40,
  margin: 8,
  maxWidth: 480,
  visibility: getShowSearch(location) ? undefined : 'hidden'
}))

const SearchIcon = styled('div')({
  height: 24,
  width: 24,
  color: '#fff',
  cursor: 'pointer',
  margin: 12
})

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
  const {location} = useRouter()
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
    <Wrapper location={location}>
      <Input
        ref={inputRef}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={'Search'}
        value={dashSearch}
        className='m-0 h-full w-full appearance-none border-transparent bg-transparent px-4 py-3 text-slate-200 text-xl leading-6 outline-none placeholder:text-slate-200/50 focus:outline-none focus-visible:border-transparent'
        maxLength={255}
      />
      <SearchIcon onClick={onClick}>
        <Icon />
      </SearchIcon>
    </Wrapper>
  )
}

export default TopBarSearch
