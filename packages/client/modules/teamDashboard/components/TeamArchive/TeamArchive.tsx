import React, {Component} from 'react'
import {createPaginationContainer, RelayPaginationProp} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {AutoSizer, CellMeasurer, CellMeasurerCache, Grid, InfiniteLoader} from 'react-virtualized'
import NullableTask from '../../../../components/NullableTask/NullableTask'
import Helmet from 'react-helmet'
import TeamArchiveHeader from '../TeamArchiveHeader/TeamArchiveHeader'
import getRallyLink from '../../../userDashboard/helpers/getRallyLink'
import ui from '../../../../styles/ui'
import {TeamArchive_viewer} from '__generated__/TeamArchive_viewer.graphql'
import {AreaEnum} from '../../../../types/graphql'
import {TeamArchive_team} from '__generated__/TeamArchive_team.graphql'
import styled from '@emotion/styled'
import {Breakpoint, MathEnum} from '../../../../types/constEnums'
import {PALETTE} from '../../../../styles/paletteV2'

const CARD_WIDTH = 256 + 32 // account for box model and horizontal padding
const GRID_PADDING = 16
const NAV_WIDTH = parseInt(ui.dashSidebarWidth, 10) * 16

const getColumnCount = () => {
  if (typeof window === 'undefined') return 4
  const {innerWidth} = window
  return Math.floor((innerWidth - NAV_WIDTH - GRID_PADDING) / CARD_WIDTH)
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
  padding: `0 0 0 20px`,

  [`@media (min-width: ${Breakpoint.DASHBOARD_WIDE})`]: {
    paddingLeft: 32
  }
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
  position: 'relative',

  [`@media (min-width: ${Breakpoint.DASHBOARD_WIDE})`]: {
    paddingLeft: 24
  }
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
  padding: 16,

  [`@media (min-width: ${Breakpoint.DASHBOARD_WIDE})`]: {
    margin: 32
  }
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

class TeamArchive extends Component<Props> {
  columnCount: number
  _onRowsRendered: any
  gridRef: any

  constructor(props) {
    super(props)
    this.columnCount = getColumnCount()
  }

  componentWillUpdate(nextProps) {
    const {viewer} = this.props
    const {archivedTasks} = viewer
    const {edges: oldEdges} = archivedTasks!
    const {
      viewer: {
        archivedTasks: {edges}
      }
    } = nextProps
    this.invalidateOnAddRemove(oldEdges, edges)
  }

  getGridIndex(index) {
    const rowIndex = Math.floor(index / this.columnCount)
    const columnIndex = index % this.columnCount
    return {rowIndex, columnIndex}
  }

  getIndex(columnIndex, rowIndex) {
    return this.columnCount * rowIndex + columnIndex
  }

  isRowLoaded = ({index}) => {
    const {viewer} = this.props
    const {archivedTasks} = viewer
    const {edges} = archivedTasks!
    return index < edges.length
  }

  loadMore = () => {
    const {
      relay: {hasMore, isLoading, loadMore}
    } = this.props
    if (!hasMore() || isLoading()) return
    loadMore(this.columnCount * 10)
  }

  cellCache = new CellMeasurerCache({
    defaultHeight: 182,
    minHeight: 106,
    fixedWidth: true
  })

  invalidateOnAddRemove(oldEdges, edges) {
    if (
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
      const {columnIndex, rowIndex} = this.getGridIndex(ii)
      this.gridRef.recomputeGridSize({columnIndex, rowIndex})
      this.cellCache.clearAll()
    }
  }

  rowRenderer = ({columnIndex, parent, rowIndex, key, style}) => {
    // TODO render a very inexpensive lo-fi card while scrolling. We should reuse that cheap card for drags, too
    const {viewer} = this.props
    const {archivedTasks} = viewer
    const {edges} = archivedTasks!
    const index = this.getIndex(columnIndex, rowIndex)
    if (!this.isRowLoaded({index})) return undefined
    const task = edges[index].node
    return (
      <CellMeasurer
        cache={this.cellCache}
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
              <NullableTask
                key={key}
                area={AreaEnum.teamDash}
                measure={measure}
                task={task}
              />
            </div>
          )
        }}
      </CellMeasurer>
    )
  }

  _onSectionRendered = ({columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex}) => {
    this._onRowsRendered({
      startIndex: this.getIndex(columnStartIndex, rowStartIndex),
      stopIndex: this.getIndex(columnStopIndex, rowStopIndex)
    })
  }

  render() {
    const {team, teamId, viewer} = this.props
    if (!team) return null
    const {teamName} = team
    const {archivedTasks} = viewer
    const {edges} = archivedTasks!
    return (
      <Root>
        <Helmet title={`Team Archive | ${teamName}`} />
        <Header>
          <TeamArchiveHeader teamId={teamId} />
          <Border />
        </Header>

        <Body>
          {edges.length ? (
            <CardGrid>
              <InfiniteLoader
                isRowLoaded={this.isRowLoaded}
                loadMoreRows={this.loadMore}
                rowCount={MathEnum.MAX_INT}
              >
                {({onRowsRendered, registerChild}) => {
                  this._onRowsRendered = onRowsRendered
                  return (
                    <div style={{flex: '1 1 auto'}}>
                      <AutoSizer>
                        {({height, width}) => {
                          return (
                            <Grid
                              cellRenderer={this.rowRenderer}
                              columnCount={this.columnCount}
                              columnWidth={CARD_WIDTH}
                              deferredMeasurementCache={this.cellCache}
                              estimatedColumnSize={CARD_WIDTH}
                              estimatedRowSize={182}
                              height={height}
                              onRowsRendered={onRowsRendered}
                              onSectionRendered={this._onSectionRendered}
                              ref={(c) => {
                                this.gridRef = c
                                registerChild(c)
                              }}
                              rowCount={Math.ceil(edges.length / this.columnCount)}
                              rowHeight={this.cellCache.rowHeight}
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
