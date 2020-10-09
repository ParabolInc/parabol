import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer, commitLocalUpdate} from 'react-relay'
import {ParabolScopingSearchInput_meeting} from '../__generated__/ParabolScopingSearchInput_meeting.graphql'
import styled from '@emotion/styled'
import Icon from './Icon'
import Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '~/styles/paletteV2'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1
})

const SearchInput = styled('input')({
  appearance: 'none',
  border: '1px solid transparent',
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  margin: 0,
  outline: 0,
  backgroundColor: 'transparent',
  width: '100%'
})

const ClearSearchIcon = styled(Icon)<{isEmpty: boolean}>(({isEmpty}) => ({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  padding: 12,
  visibility: isEmpty ? 'hidden' : undefined
}))

const setSearch = (atmosphere: Atmosphere, meetingId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    if (!meeting) return
    meeting.setValue(value, 'parabolSearchQuery')
  })
}

interface Props {
  meeting: ParabolScopingSearchInput_meeting
}

const ParabolScopingSearchInput = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, parabolSearchQuery} = meeting
  const isEmpty = !parabolSearchQuery
  const atmosphere = useAtmosphere()
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(atmosphere, meetingId, e.target.value)
  }
  const clearSearch = () => setSearch(atmosphere, meetingId, '')
  // const onKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key !== 'Enter' || e.shiftKey) return
  //   onSubmit()
  // }
  // const onSubmit = () => {
  //   const filterQuery = meeting.parabolSearchQuery
  //   if (filterQuery === null) return
  // }
  // TODO: fix unintuitive input UI behavior
  return (
    <Wrapper>
      <SearchInput
        value={parabolSearchQuery || ''}
        placeholder={'Search Parabol tasks'}
        onChange={onChange}
      />
      <ClearSearchIcon isEmpty={isEmpty} onClick={clearSearch}>
        close
      </ClearSearchIcon>
    </Wrapper>
  )
}

export default createFragmentContainer(ParabolScopingSearchInput, {
  meeting: graphql`
    fragment ParabolScopingSearchInput_meeting on PokerMeeting {
      id
      parabolSearchQuery
    }
  `
})
