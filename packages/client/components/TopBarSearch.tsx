import styled from '@emotion/styled'
import {Close, Search} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {useFragment} from 'react-relay'
import {matchPath, RouteProps} from 'react-router'
import {commitLocalUpdate} from 'relay-runtime'
import useAtmosphere from '~/hooks/useAtmosphere'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import {TopBarSearch_viewer$key} from '~/__generated__/TopBarSearch_viewer.graphql'
import Atmosphere from '../Atmosphere'

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
  const inputRef = useRef<HTMLInputElement>(null)
  const atmosphere = useAtmosphere()
  const {location} = useRouter()
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(atmosphere, e.target.value)
  }
  const Icon = dashSearch ? Close : Search
  const onClick = () => {
    setSearch(atmosphere, '')
    inputRef.current?.focus()
  }
  return (
    <Wrapper location={location}>
      <SearchInput ref={inputRef} onChange={onChange} placeholder={'Search'} value={dashSearch} />
      <SearchIcon onClick={onClick}>
        <Icon />
      </SearchIcon>
    </Wrapper>
  )
}

export default TopBarSearch
