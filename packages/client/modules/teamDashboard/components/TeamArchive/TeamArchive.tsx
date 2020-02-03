import React, {useEffect, useRef, useState} from 'react'
import {createPaginationContainer, RelayPaginationProp} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {AutoSizer, CellMeasurer, CellMeasurerCache, Grid, InfiniteLoader} from 'react-virtualized'
import NullableTask from '../../../../components/NullableTask/NullableTask'
import TeamArchiveHeader from '../TeamArchiveHeader/TeamArchiveHeader'
import getRallyLink from '../../../userDashboard/helpers/getRallyLink'
import {TeamArchive_viewer} from '__generated__/TeamArchive_viewer.graphql'
import {AreaEnum} from '../../../../types/graphql'
import {TeamArchive_team} from '__generated__/TeamArchive_team.graphql'
import styled from '@emotion/styled'
import {MathEnum, NavSidebar} from '../../../../types/constEnums'
import {PALETTE} from '../../../../styles/paletteV2'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'

const CARD_WIDTH = 256 + 32 // account for box model and horizontal padding
const GRID_PADDING = 16

const getColumnCount = () => {
  if (typeof window === 'undefined') return 4
  const {innerWidth} = window
  return Math.floor((innerWidth - NavSidebar.WIDTH - GRID_PADDING) / CARD_WIDTH)
}

const getGridIndex = (index: number, columnCount: number) => {
  const rowIndex = Math.floor(index / columnCount)
  const columnIndex = index % columnCount
  return {rowIndex, columnIndex}
}

const Root = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  // hide the window scrollbar, the cardGrid scrollbar will mimic the window scrollbar
  overflow: 'hidden',
  width: '100%'
})

const Header = styled('div')({
  padding: `0 0 0 20px`
})

const Border = styled('div')({
  borderTop: `.0625rem solid ${PALETTE.BORDER_LIGHTER}`,
  height: 1,
  width: '100%'
})

const Body = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  paddingLeft: '12',
  position: 'relative'
})
const CardGrid = styled('div')({
  border: 0,
  display: 'flex',
  // grow to the largest height possible
  flex: 1,
  outline: 0,
  width: '100%'
})

const EmptyMsg = styled('div')({
  backgroundColor: '#FFFFFF',
  border: `1px solid ${PALETTE.BORDER_LIGHT}`,
  borderRadius: 4,
  fontSize: 14,
  display: 'inline-block',
  margin: 20,
  padding: 16
})

const LinkSpan = styled('div')({
  color: PALETTE.BACKGROUND_TEAL
})

interface Props {
  relay: RelayPaginationProp
  viewer: TeamArchive_viewer
  teamId: string
  team: TeamArchive_team
}

const TeamArchive = (props: Props) => {
  const {viewer, relay, team, teamId} = props
  const {hasMore, isLoading, loadMore} = relay
  const {teamName} = team
  const {archivedTasks} = viewer
  const {edges} = archivedTasks!
  const [columnCount] = useState(getColumnCount)
  const _onRowsRenderedRef = useRef<
    ({startIndex, stopIndex}: {startIndex: number; stopIndex: number}) => void
  >()
  const gridRef = useRef<any>(null)
  const oldEdgesRef = useRef<typeof edges>()
  const getIndex = (columnIndex: number, rowIndex: number) => {
    return columnCount * rowIndex + columnIndex
  }
  const isRowLoaded = ({index}) => index < edges.length
  const maybeLoadMore = () => {
    if (!hasMore() || isLoading()) return
    loadMore(columnCount * 10)
  }
  const [cellCache] = useState(
    () =>
      new CellMeasurerCache({
        defaultHeight: 182,
        minHeight: 106,
        fixedWidth: true
      })
  )

  const invalidateOnAddRemove = (oldEdges, edges) => {
    if (
      edges &&
      oldEdges &&
      edges !== oldEdges &&
      edges.length !== oldEdges.length &&
      edges.length > 0 &&
      oldEdges.length > 0
    ) {
      const minLen = Math.min(oldEdges.length, edges.length)
      // if a new page is added, don't bother resizing, it isn't from a subscription or mutation
      if (
        oldEdges.length === minLen &&
        oldEdges[minLen - 1].node.id === edges[minLen - 1].node.id
      ) {
        return
      }
      // find the edge that changed. imperatively/efficiently since this can get large
      let ii
      for (ii = 0; ii < minLen; ii++) {
        const oldEdge = oldEdges[ii]
        const newEdge = edges[ii]
        if (oldEdge.node.id !== newEdge.node.id) {
          break
        }
      }
      const {columnIndex, rowIndex} = getGridIndex(ii, columnCount)
      gridRef.current.recomputeGridSize({columnIndex, rowIndex})
      cellCache.clearAll()
    }
  }

  useEffect(() => {
    const {current: oldEdges} = oldEdgesRef
    invalidateOnAddRemove(oldEdges, edges)
    oldEdgesRef.current = edges
  }, [edges, oldEdgesRef])

  useDocumentTitle(`Team Archive | ${teamName}`, 'Archive')
  const rowRenderer = ({columnIndex, parent, rowIndex, key, style}) => {
    // TODO render a very inexpensive lo-fi card while scrolling. We should reuse that cheap card for drags, too
    const index = getIndex(columnIndex, rowIndex)
    if (!isRowLoaded({index})) return undefined
    const task = edges[index].node
    return (
      <CellMeasurer
        cache={cellCache}
        columnIndex={columnIndex}
        key={key}
        parent={parent}
        rowIndex={rowIndex}
      >
        {({measure}) => {
          return (
            // put styles here because aphrodite is async
            <div
              key={`cardBlockFor${task.id}`}
              style={{...style, width: CARD_WIDTH, padding: '1rem 0.5rem 0'}}
            >
              <NullableTask key={key} area={AreaEnum.teamDash} measure={measure} task={task} />
            </div>
          )
        }}
      </CellMeasurer>
    )
  }

  const _onSectionRendered = ({columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex}) => {
    if (!_onRowsRenderedRef.current) return
    _onRowsRenderedRef.current({
      startIndex: getIndex(columnStartIndex, rowStartIndex),
      stopIndex: getIndex(columnStopIndex, rowStopIndex)
    })
  }

  return (
    <Root>
      <Header>
        <TeamArchiveHeader teamId={teamId} />
        <Border />
      </Header>
      <Body>
        {edges.length ? (
          <CardGrid>
            <InfiniteLoader
              isRowLoaded={isRowLoaded}
              loadMoreRows={maybeLoadMore}
              rowCount={MathEnum.MAX_INT}
            >
              {({onRowsRendered, registerChild}) => {
                _onRowsRenderedRef.current = onRowsRendered
                return (
                  <div style={{flex: '1 1 auto'}}>
                    <AutoSizer>
                      {({height, width}) => {
                        return (
                          <Grid
                            cellRenderer={rowRenderer}
                            columnCount={columnCount}
                            columnWidth={CARD_WIDTH}
                            deferredMeasurementCache={cellCache}
                            estimatedColumnSize={CARD_WIDTH}
                            estimatedRowSize={182}
                            height={height}
                            onRowsRendered={onRowsRendered}
                            onSectionRendered={_onSectionRendered}
                            ref={(c) => {
                              gridRef.current = c
                              registerChild(c)
                            }}
                            rowCount={Math.ceil(edges.length / columnCount)}
                            rowHeight={cellCache.rowHeight}
                            style={{outline: 'none'}}
                            width={width}
                          />
                        )
                      }}
                    </AutoSizer>
                  </div>
                )
              }}
            </InfiniteLoader>
          </CardGrid>
        ) : (
          <EmptyMsg>
            <span>
              {'🤓'}
              {' Hi there! There are zero archived tasks. '}
              {'Nothing to see here. How about a fun rally video? '}
              <LinkSpan>{getRallyLink()}!</LinkSpan>
            </span>
          </EmptyMsg>
        )}
      </Body>
    </Root>
  )
}

export default createPaginationContainer(
  TeamArchive,
  {
    viewer: graphql`
      fragment TeamArchive_viewer on User {
        archivedTasks(first: $first, teamId: $teamId, after: $after)
          @connection(key: "TeamArchive_archivedTasks") {
          edges {
            cursor
            node {
              id
              ...NullableTask_task
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
    team: graphql`
      fragment TeamArchive_team on Team {
        teamName: name
        orgId
      }
    `
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.archivedTasks
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables(_props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      }
    },
    query: graphql`
      query TeamArchivePaginationQuery($first: Int!, $after: DateTime, $teamId: ID!) {
        viewer {
          ...TeamArchive_viewer
        }
      }
    `
  }
)
