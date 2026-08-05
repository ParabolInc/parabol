import {Search as SearchIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import type {SpotlightSearchBar_meeting$key} from '../__generated__/SpotlightSearchBar_meeting.graphql'
import type Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

const setSpotlightSearch = (atmosphere: Atmosphere, meetingId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    if (!meeting) return
    meeting.setValue(value, 'spotlightSearchQuery')
  })
}

interface Props {
  meetingRef: SpotlightSearchBar_meeting$key
}

const SpotlightSearchBar = (props: Props) => {
  const {meetingRef} = props
  const hasSearchedRef = useRef(false)
  const meeting = useFragment(
    graphql`
      fragment SpotlightSearchBar_meeting on RetrospectiveMeeting {
        id
        spotlightSearchQuery
        spotlightReflectionId
      }
    `,
    meetingRef
  )
  const {id: meetingId, spotlightSearchQuery, spotlightReflectionId} = meeting
  const atmosphere = useAtmosphere()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpotlightSearch(atmosphere, meetingId, e.currentTarget.value)
    if (!hasSearchedRef.current) {
      SendClientSideEvent(atmosphere, 'Searched in Spotlight', {
        reflectionId: spotlightReflectionId,
        meetingId
      })
      hasSearchedRef.current = true
    }
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && inputRef.current) {
      e.stopPropagation()
      e.preventDefault()
      inputRef.current.blur()
    }
  }

  return (
    <div className='w-[296px]'>
      <MenuItemLabel className='absolute bottom-[-22px] w-[296px] overflow-visible p-0'>
        <MenuItemComponentAvatar className='absolute top-2 left-2'>
          <SearchIcon className='text-fg-secondary' />
        </MenuItemComponentAvatar>
        <input
          className='block w-full appearance-none rounded border border-accent bg-surface-input py-1.5 pr-0 pl-10 text-fg-primary text-sm leading-6 shadow-[0_0_1px_1px_var(--color-sky-300)] outline-none placeholder:text-fg-secondary'
          onKeyDown={onKeyDown}
          autoFocus
          autoComplete='off'
          name='search'
          placeholder='Or search for keywords...'
          type='text'
          spellCheck={true}
          onChange={onChange}
          ref={inputRef}
          value={spotlightSearchQuery ?? ''}
        />
      </MenuItemLabel>
    </div>
  )
}

export default SpotlightSearchBar
