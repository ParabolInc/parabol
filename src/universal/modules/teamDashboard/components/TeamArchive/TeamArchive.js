import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {createPaginationContainer} from 'react-relay';
import {CellMeasurer, CellMeasurerCache, Grid, InfiniteLoader, WindowScroller} from 'react-virtualized';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import TeamArchiveHeader from 'universal/modules/teamDashboard/components/TeamArchiveHeader/TeamArchiveHeader';
import TeamArchiveSqueezeRoot from 'universal/modules/teamDashboard/containers/TeamArchiveSqueezeRoot';
import getRallyLink from 'universal/modules/userDashboard/helpers/getRallyLink';
import {ib} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/theme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {MAX_INT, PERSONAL, TEAM_DASH} from 'universal/utils/constants';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const iconStyle = {
  ...ib,
  fontSize: ui.iconSize,
  marginRight: '.25rem'
};

const CARD_WIDTH = 256;
const GRID_PADDING = 16;
const NAV_WIDTH = parseInt(ui.dashSidebarWidth, 10) * 16;

const getColumnCount = () => {
  if (typeof window === 'undefined') return 4;
  const {innerWidth} = window;
  return Math.floor((innerWidth - NAV_WIDTH - GRID_PADDING) / CARD_WIDTH);
};

class TeamArchive extends Component {
  constructor(props) {
    super(props);
    this.columnCount = getColumnCount();
    this.archiveWidth = this.columnCount * CARD_WIDTH + 16;
  }

  componentWillUpdate(nextProps) {
    const {viewer: {archivedProjects: {edges: oldEdges}}} = this.props;
    const {viewer: {archivedProjects: {edges}}} = nextProps;
    this.invalidateOnAddRemove(oldEdges, edges);
  }

  getGridIndex(index) {
    const rowIndex = Math.floor(index / this.columnCount);
    const columnIndex = index % this.columnCount;
    return {rowIndex, columnIndex};
  }

  getIndex(columnIndex, rowIndex) {
    return this.columnCount * rowIndex + columnIndex;
  }

  getGridRowCount = () => {
    const {viewer: {archivedProjects: {edges}}} = this.props;
    const currentCount = edges.length;
    return Math.ceil(currentCount / this.columnCount);
  };

  isRowLoaded = ({index}) => {
    return Boolean(this.props.viewer.archivedProjects.edges[index]);
  };

  loadMore = () => {
    const {relay: {hasMore, isLoading, loadMore}} = this.props;
    if (!hasMore() || isLoading()) return;
    loadMore(this.columnCount * 10);
  };

  cellCache = new CellMeasurerCache({
    defaultHeight: 180,
    minHeight: 106,
    fixedWidth: true
  });

  invalidateOnAddRemove(oldEdges, edges) {
    if (edges !== oldEdges && edges.length !== oldEdges.length && edges.length > 0 && oldEdges.length > 0) {
      const minLen = Math.min(oldEdges.length, edges.length);
      // if a new page is added, don't bother resizing, it isn't from a subscription or mutation
      if (oldEdges.length === minLen && oldEdges[minLen - 1].node.id === edges[minLen - 1].node.id) return;
      // find the edge that changed. imperatively/efficiently since this can get large
      let ii;
      for (ii = 0; ii < minLen; ii++) {
        const oldEdge = oldEdges[ii];
        const newEdge = edges[ii];
        if (oldEdge.node.id !== newEdge.node.id) {
          break;
        }
      }
      const {columnIndex, rowIndex} = this.getGridIndex(ii);
      this.gridRef.recomputeGridSize({columnIndex, rowIndex});
      this.cellCache.clearAll();
    }
  }

  rowRenderer = ({columnIndex, parent, rowIndex, key, style}) => {
    // TODO render a very inexpensive lo-fi card while scrolling. We should reuse that cheap card for drags, too
    const {viewer: {archivedProjects: {edges}}, userId} = this.props;
    const index = this.getIndex(columnIndex, rowIndex);
    if (!this.isRowLoaded({index})) return undefined;
    const project = edges[index].node;
    return (
      <CellMeasurer
        cache={this.cellCache}
        columnIndex={columnIndex}
        key={key}
        parent={parent}
        rowIndex={rowIndex}
      >
        {/* Put padding here because of aphrodite's async annoyance */}
        <div key={`cardBlockFor${project.id}`} style={{...style, width: CARD_WIDTH, padding: '0.5rem'}}>
          <OutcomeOrNullCard
            key={key}
            area={TEAM_DASH}
            myUserId={userId}
            outcome={{
              ...project,
              id: fromGlobalId(project.id).id,
              createdAt: new Date(project.createdAt),
              updatedAt: new Date(project.updatedAt),
              teamMember: {
                ...project.teamMember,
                id: fromGlobalId(project.teamMember.id).id
              }
            }}
          />
        </div>
      </CellMeasurer>
    );
  };

  _infiniteLoaderChildFunction = ({onRowsRendered, registerChild}) => {
    this._onRowsRendered = onRowsRendered;
    return (
      <WindowScroller>
        {({height, isScrolling, onChildScroll, scrollTop}) => (
          <Grid
            autoHeight
            cellRenderer={this.rowRenderer}
            columnCount={this.columnCount}
            columnWidth={CARD_WIDTH}
            deferredMeasurementCache={this.cellCache}
            estimatedColumnSize={CARD_WIDTH}
            height={height}
            isScrolling={isScrolling}
            onRowsRendered={onRowsRendered}
            onScroll={onChildScroll}
            onSectionRendered={this._onSectionRendered}
            ref={(c) => {
              this.gridRef = c;
              registerChild(c);
            }}
            rowCount={this.getGridRowCount()}
            rowHeight={this.cellCache.rowHeight}
            scrollTop={scrollTop}
            width={this.archiveWidth}
          />
        )}
      </WindowScroller>
    );
  }

  _onSectionRendered = ({columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex}) => {
    this._onRowsRendered({
      startIndex: this.getIndex(columnStartIndex, rowStartIndex),
      stopIndex: this.getIndex(columnStopIndex, rowStopIndex)
    });
  };

  render() {
    const {relay: {hasMore}, styles, team, teamId, viewer} = this.props;
    const {name: teamName, tier, orgId} = team;
    const {archivedProjects} = viewer;
    const {edges} = archivedProjects;
    // Archive squeeze
    const showArchiveSqueeze = Boolean(tier === PERSONAL && !hasMore());

    return (
      <div className={css(styles.root)}>
        <Helmet title={`${teamName} Archive | Parabol`} />
        <div className={css(styles.header)}>
          <TeamArchiveHeader teamId={teamId} />
          <div className={css(styles.border)} />
        </div>

        <div className={css(styles.body)}>
          {edges.length ?
            <div className={css(styles.cardGrid)}>
              <InfiniteLoader
                isRowLoaded={this.isRowLoaded}
                loadMoreRows={this.loadMore}
                rowCount={MAX_INT}
              >
                {this._infiniteLoaderChildFunction}
              </InfiniteLoader>
            </div> :
            <div className={css(styles.emptyMsg)}>
              <FontAwesome name="smile-o" style={iconStyle} />
              <span style={ib}>
                {'Hi there! There are zero archived projects. '}
                {'Nothing to see here. How about a fun rally video? '}
                <span className={css(styles.link)}>{getRallyLink()}!</span>
              </span>
            </div>
          }
          {showArchiveSqueeze &&
          <div className={css(styles.archiveSqueezeBlock)}>
            <TeamArchiveSqueezeRoot
              projectsAvailableCount={edges.length}
              orgId={orgId}
              teamId={teamId}
            />
          </div>
          }
        </div>
      </div>
    );
  }
}

TeamArchive.propTypes = {
  relay: PropTypes.object.isRequired,
  styles: PropTypes.object,
  team: PropTypes.shape({
    name: PropTypes.string.isRequired,
    orgId: PropTypes.string.isRequired,
    tier: PropTypes.string.isRequired
  }),
  teamId: PropTypes.string,
  userId: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  header: {
    padding: '0 0 0 1rem'
  },

  border: {
    borderTop: `1px solid ${ui.dashBorderColor}`,
    height: '.0625rem',
    width: '100%'
  },

  body: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    position: 'relative'
  },

  cardGrid: {
    padding: '.5rem',
    width: '100%'
  },

  emptyMsg: {
    backgroundColor: '#fff',
    border: `1px solid ${appTheme.palette.mid30l}`,
    borderRadius: '.25rem',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s2,
    fontStyle: 'italic',
    display: 'inline-block',
    padding: '1rem'
  },

  link: {
    color: appTheme.palette.cool
  },

  archiveSqueezeBlock: {
    padding: '1rem',
    width: '100%'
  }
});

export default createPaginationContainer(
  withStyles(styleThunk)(TeamArchive),
  graphql`
    fragment TeamArchive_viewer on User {
      archivedProjects(first: $first, teamId: $teamId, after: $after) @connection(key: "TeamArchive_archivedProjects") {
        edges {
          cursor
          node {
            id
            content
            createdAt
            integration {
              service
              nameWithOwner
              issueNumber
            }
            status
            tags
            teamMemberId
            updatedAt
            teamMember {
              id
              picture
              preferredName
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.archivedProjects;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      };
    },
    query: graphql`
      query TeamArchivePaginationQuery($first: Int!, $after: DateTime, $teamId: ID!) {
        viewer {
          ...TeamArchive_viewer
        }
      }
    `
  }
);
