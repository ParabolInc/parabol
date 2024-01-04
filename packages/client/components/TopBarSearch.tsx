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
  display: 'flex',
  flex: 1,
  height: 40,
  margin: 8,
  maxWidth: 480,
  visibility: getShowSearch(location) ? undefined : 'hidden'
}))

const SearchInput = styled('input')({
  appearance: 'none',
  backgroundColor: PALETTE.SLATE_300,
  border: `1px solid ${PALETTE.SLATE_300}`,
  borderRadius: 4,
  color: PALETTE.SLATE_900,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  margin: 0,
  outline: 0,
  padding: '8px 16px',
  width: '100%',
  ':placeholder': {
    color: PALETTE.SLATE_500
  },
  ':focus': {
    border: `1px solid ${PALETTE.SKY_500}`
  }
})

const SearchIcon = styled('div')({
  height: 24,
  width: 24,
  color: PALETTE.SLATE_500,
  cursor: 'pointer',
  margin: '8px 12px 8px -32px'
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
      <SearchInput
        ref={inputRef}
        onChange={onChange}
        placeholder={'Search for activities or tasks'}
        value={dashSearch}
      />
      <SearchIcon onClick={onClick}>
        <Icon />
      </SearchIcon>
    </Wrapper>
  )
}

export default TopBarSearch
