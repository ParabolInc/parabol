import styled from '@emotion/styled'
import {Close, Search} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {matchPath, type RouteProps} from 'react-router'
import {commitLocalUpdate} from 'relay-runtime'
import type {TopBarSearch_viewer$key} from '~/__generated__/TopBarSearch_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
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
    }) ||
    pathname.startsWith('/pages')
  )
}
interface Props {
  viewer: TopBarSearch_viewer$key | null
}

const Wrapper = styled('div')<{location: any}>(({location}) => ({
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

const SearchInput = styled('input')({
  appearance: 'none',
  border: '1px solid transparent',
  color: PALETTE.SLATE_200,
  fontSize: 20,
  lineHeight: '24px',
  margin: 0,
  outline: 0,
  padding: '12px 16px',
  backgroundColor: 'transparent',
  width: '100%'
})

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

  // Initialize local state with viewer val
  const [value, setValue] = useState(dashSearch)

  // Sync local state if viewer prop updates explicitly (e.g. navigation)
  useEffect(() => {
    setValue(dashSearch)
  }, [dashSearch])

  const inputRef = useRef<HTMLInputElement>(null)
  const atmosphere = useAtmosphere()
  const {location, history} = useRouter()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    setSearch(atmosphere, e.target.value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (location.pathname.includes('/meetings')) return
      // Use local value for redirect
      history.push(`/search?q=${encodeURIComponent(value)}`)
    }
  }

  const Icon = value ? Close : Search
  const onClick = () => {
    setSearch(atmosphere, '')
    setValue('')
    inputRef.current?.focus()
  }

  let placeholder = 'Search'
  if (location.pathname.includes('/me/tasks')) {
    placeholder = 'Filter tasks'
  } else if (location.pathname.includes('/meetings')) {
    placeholder = 'Filter meetings'
  }

  return (
    <Wrapper location={location}>
      <SearchInput
        ref={inputRef}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        value={value}
      />
      <SearchIcon onClick={onClick}>
        <Icon />
      </SearchIcon>
    </Wrapper>
  )
}

export default TopBarSearch
