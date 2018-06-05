import {css} from 'aphrodite-local-styles/no-important'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import FontAwesome from 'react-fontawesome'
import {createPaginationContainer} from 'react-relay'
import {AutoSizer, CellMeasurer, CellMeasurerCache, Grid, InfiniteLoader} from 'react-virtualized'
import NullableTask from 'universal/components/NullableTask/NullableTask'
import Helmet from 'react-helmet'
import TeamArchiveHeader from 'universal/modules/teamDashboard/components/TeamArchiveHeader/TeamArchiveHeader'
import TeamArchiveSqueezeRoot from 'universal/modules/teamDashboard/containers/TeamArchiveSqueezeRoot'
import getRallyLink from 'universal/modules/userDashboard/helpers/getRallyLink'
import appTheme from 'universal/styles/theme/theme'
import ui from 'universal/styles/ui'
import withStyles from 'universal/styles/withStyles'
import {MAX_INT, PERSONAL, TEAM_DASH} from 'universal/utils/constants'

const iconStyle = {
  fontSize: ui.iconSize,
  marginRight: '.25rem'
}

const CARD_WIDTH = 256
const GRID_PADDING = 16
const NAV_WIDTH = parseInt(ui.dashSidebarWidth, 10) * 16

const getColumnCount = () => {
  if (typeof window === 'undefined') return 4
  const {innerWidth} = window
  return Math.floor((innerWidth - NAV_WIDTH - GRID_PADDING) / CARD_WIDTH)
}

class TeamArchive extends Component {
  constructor (props) {
    super(props)
    this.columnCount = getColumnCount()
  }

  componentWillUpdate (nextProps) {
    const {
      viewer: {
        archivedTasks: {edges: oldEdges}
      }
    } = this.props
    const {
      viewer: {
        archivedTasks: {edges}
      }
    } = nextProps
    this.invalidateOnAddRemove(oldEdges, edges)
  }

  getGridIndex (index) {
    const rowIndex = Math.floor(index / this.columnCount)
    const columnIndex = index % this.columnCount
    return {rowIndex, columnIndex}
  }

  getIndex (columnIndex, rowIndex) {
    return this.columnCount * rowIndex + columnIndex
  }

  isRowLoaded = ({index}) => {
    const {
      viewer: {
        archivedTasks: {edges}
      }
    } = this.props
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

  invalidateOnAddRemove (oldEdges, edges) {
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
    const {
      viewer: {
        archivedTasks: {edges}
      },
      userId
    } = this.props
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
                area={TEAM_DASH}
                measure={measure}
                myUserId={userId}
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

  render () {
    const {
      relay: {hasMore},
      styles,
      team,
      teamId,
      viewer
    } = this.props
    const {teamName, tier, orgId} = team
    const {archivedTasks} = viewer
    const {edges} = archivedTasks
    // Archive squeeze
    const showArchiveSqueeze = Boolean(tier === PERSONAL && !hasMore())

    return (
      <div className={css(styles.root)}>
        <Helmet title={`Team Archive | ${teamName}`} />
        <div className={css(styles.header)}>
          <TeamArchiveHeader teamId={teamId} />
          <div className={css(styles.border)} />
        </div>

        <div className={css(styles.body)}>
          {edges.length ? (
            <div className={css(styles.cardGrid)}>
              <InfiniteLoader
                isRowLoaded={this.isRowLoaded}
                loadMoreRows={this.loadMore}
                rowCount={MAX_INT}
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
            </div>
          ) : (
            <div className={css(styles.emptyMsg)}>
              <FontAwesome name='smile-o' style={iconStyle} />
              <span>
                {'Hi there! There are zero archived tasks. '}
                {'Nothing to see here. How about a fun rally video? '}
                <span className={css(styles.link)}>{getRallyLink()}!</span>
              </span>
            </div>
          )}
          {showArchiveSqueeze && (
            <div className={css(styles.archiveSqueezeBlock)}>
              <TeamArchiveSqueezeRoot
                tasksAvailableCount={edges.length}
                orgId={orgId}
                teamId={teamId}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}

TeamArchive.propTypes = {
  relay: PropTypes.object.isRequired,
  styles: PropTypes.object,
  team: PropTypes.object,
  teamId: PropTypes.string,
  userId: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired
}

const styleThunk = () => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    // hide the window scrollbar, the cardGrid scrollbar will mimic the window scrollbar
    overflow: 'hidden',
    width: '100%'
  },

  header: {
    padding: `0 0 0 ${ui.dashGutterSmall}`,

    [ui.dashBreakpoint]: {
      paddingLeft: ui.dashGutterLarge
    }
  },

  border: {
    borderTop: `.0625rem solid ${ui.dashBorderColor}`,
    height: '.0625rem',
    width: '100%'
  },

  body: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingLeft: '.75rem',
    position: 'relative',

    [ui.dashBreakpoint]: {
      paddingLeft: '1.5rem'
    }
  },

  cardGrid: {
    border: 0,
    display: 'flex',
    // grow to the largest height possible
    flex: 1,
    outline: 0,
    width: '100%'
  },

  emptyMsg: {
    backgroundColor: '#fff',
    border: `.0625rem solid ${appTheme.palette.mid30l}`,
    borderRadius: '.25rem',
    fontSize: appTheme.typography.s2,
    display: 'inline-block',
    margin: ui.dashGutterSmall,
    padding: '1rem',

    [ui.dashBreakpoint]: {
      margin: ui.dashGutterLarge
    }
  },

  link: {
    color: appTheme.palette.cool
  },

  archiveSqueezeBlock: {
    padding: '1rem',
    width: '100%'
  }
})

export default createPaginationContainer(
  withStyles(styleThunk)(TeamArchive),
  graphql`
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

    fragment TeamArchive_team on Team {
      teamName: name
      orgId
      tier
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps (props) {
      return props.viewer && props.viewer.archivedTasks
    },
    getFragmentVariables (prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables (props, {count, cursor}, fragmentVariables) {
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
