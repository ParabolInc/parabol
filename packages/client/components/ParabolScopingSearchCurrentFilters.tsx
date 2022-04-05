import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {ParabolScopingSearchCurrentFilters_meeting$key} from '../__generated__/ParabolScopingSearchCurrentFilters_meeting.graphql'

const Wrapper = styled('div')({
  width: '100%',
  display: 'flex',
  paddingLeft: '72px',
  paddingTop: '8px'
})

const Description = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 16,
  fontWeight: 500,
  whiteSpace: 'nowrap'
})

const Items = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 16,
  fontWeight: 600,
  fontStyle: 'italic',
  padding: '0px 24px 0px 4px',
  width: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

interface Props {
  meetingRef: ParabolScopingSearchCurrentFilters_meeting$key
}

const ParabolScopingSearchCurrentFilters = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ParabolScopingSearchCurrentFilters_meeting on PokerMeeting {
        parabolSearchQuery {
          statusFilters
        }
      }
    `,
    meetingRef
  )
  const {parabolSearchQuery} = meeting
  const {statusFilters} = parabolSearchQuery
  const formattedStatusFilters = statusFilters?.map((filter, idx) =>
    idx === 0 ? filter : `, ${filter}`
  )
  const currentFilters = formattedStatusFilters?.length ? formattedStatusFilters : 'None'

  return (
    <Wrapper>
      <Description>Current filters: </Description>
      <Items>{currentFilters}</Items>
    </Wrapper>
  )
}

export default ParabolScopingSearchCurrentFilters
