import styled from '@emotion/styled'
import {Lock} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {usePaginationFragment} from 'react-relay'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import {cardShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {TimelineFeedListPaginationQuery} from '../__generated__/TimelineFeedListPaginationQuery.graphql'
import {TimelineFeedList_query$key} from '../__generated__/TimelineFeedList_query.graphql'
import PrimaryButton from './PrimaryButton'
import TimelineEvent from './TimelineEvent'
import TimelineEventTitle from './TImelineEventTitle'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  queryRef: TimelineFeedList_query$key
}

const Surface = styled('div')({
  background: '#FFFFFF',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: 16,
  overflow: 'hidden',
  position: 'relative',
  padding: 16,
  width: '100%'
})

const TimelineEventBody = styled('div')({
  padding: '0 16px 16px 16px',
  fontSize: 14,
  lineHeight: '20px',
  textAlign: 'center'
})

const EventIcon = styled('div')({
  borderRadius: '100%',
  color: PALETTE.GRAPE_500,
  display: 'block',
  userSelect: 'none',
  height: 40,
  width: 40,
  svg: {
    height: 40,
    width: 40
  }
})

const HeaderText = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  fontSize: 14,
  justifyContent: 'space-around',
  lineHeight: '20px',
  margin: '16px 16px 8px',
  paddingTop: 2
})

const TimelineFeedList = (props: Props) => {
  const {queryRef} = props
  const paginationRes = usePaginationFragment<
    TimelineFeedListPaginationQuery,
    TimelineFeedList_query$key
  >(
    // TODO: can't `on User` directly because not implements Node (i.e. a type that has an id).
    // https://relay.dev/docs/api-reference/use-refetchable-fragment/#arguments
    graphql`
      fragment TimelineFeedList_query on Query
      @refetchable(queryName: "TimelineFeedListPaginationQuery") {
        viewer {
          timeline(first: $first, after: $after) @connection(key: "TimelineFeedList_timeline") {
            edges {
              cursor
              node {
                ...TimelineEvent_timelineEvent
                __typename
                id
                teamId
                team {
                  name
                }
                ... on TimelineEventCompletedActionMeeting {
                  meeting {
                    locked
                  }
                }
                ... on TimelineEventPokerComplete {
                  meeting {
                    locked
                  }
                }
                ... on TimelineEventTeamPromptComplete {
                  meeting {
                    locked
                  }
                }
                ... on TimelineEventCompletedRetroMeeting {
                  meeting {
                    locked
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `,
    queryRef
  )

  const {data} = paginationRes
  const {viewer} = data
  const {timeline} = viewer
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 10)

  const {freeHistory, lockedHistory} = useMemo(() => {
    const firstLocked = timeline.edges.findIndex(
      ({node: timelineEvent}) => !!timelineEvent.meeting?.locked
    )
    if (firstLocked === -1) {
      return {
        freeHistory: timeline.edges
      }
    }
    return {
      freeHistory: timeline.edges.slice(0, firstLocked),
      lockedHistory: timeline.edges.slice(firstLocked)
    }
  }, [timeline.edges])

  return (
    <ResultScroller>
      {freeHistory.map(({node: timelineEvent}) => (
        <TimelineEvent key={timelineEvent.id} timelineEvent={timelineEvent} />
      ))}
      {lockedHistory && (
        <>
          <Surface>
            <EventIcon>
              <Lock />
            </EventIcon>
            <HeaderText>
              <TimelineEventTitle>Past Meetings Locked</TimelineEventTitle>
            </HeaderText>
            <TimelineEventBody>
              Your plan includes 30 days of meeting history. Unlock{' '}
              <i>{lockedHistory[0]!.node.team?.name}</i> by upgrading.
            </TimelineEventBody>
            <PrimaryButton>Unlock past meetings</PrimaryButton>
          </Surface>
          {lockedHistory.map(({node: timelineEvent}) => (
            <TimelineEvent key={timelineEvent.id} timelineEvent={timelineEvent} />
          ))}
        </>
      )}
      {lastItem}
    </ResultScroller>
  )
}

export default TimelineFeedList
