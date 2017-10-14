import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {createPaginationContainer} from 'react-relay';
import {InfiniteLoader, List} from 'react-virtualized';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import TeamArchiveHeader from 'universal/modules/teamDashboard/components/TeamArchiveHeader/TeamArchiveHeader';
import TeamArchiveSqueeze from 'universal/modules/teamDashboard/components/TeamArchiveSqueeze/TeamArchiveSqueeze';
import getRallyLink from 'universal/modules/userDashboard/helpers/getRallyLink';
import {ib} from 'universal/styles/helpers';
import overflowTouch from 'universal/styles/helpers/overflowTouch';
import appTheme from 'universal/styles/theme/theme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {TEAM_DASH} from 'universal/utils/constants';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const iconStyle = {
  ...ib,
  fontSize: ui.iconSize,
  marginRight: '.25rem'
};

class TeamArchive extends Component {
  componentDidMount() {
    //window.addEventListener('scroll', this.checkScroll);
  }

  checkScroll = () => {
    if (!this.ref) return;
    const {height} = this.ref.getBoundingClientRect();
    const {scrollHeight, scrollTop} = this.ref;
    const bottom = scrollTop + height;
    const distanceFromBottom = 100;
    if (bottom + distanceFromBottom > scrollHeight) {
      //this.loadMore();
    }
  };

  loadMore = () => {
    const {relay: {hasMore, isLoading, loadMore}} = this.props;
    if (!hasMore() || isLoading()) return;
    loadMore(20, () => {
      console.log("CB", this.props.viewer.archivedProjects.edges.length)
    });
  };

  isRowLoaded = ({index}) => {
    const edge = this.props.viewer.archivedProjects.edges[index];
    console.log('edge', edge && edge.node)
    return edge && edge.node;
    return !!this.props.viewer.archivedProjects.edges[index];
  };

  getRowCount = () => {
    const {relay: {hasMore}, viewer: {archivedProjects: {edges}}} = this.props;
    if (hasMore()) {
      //return edges.length + 1;
    }
    return 1000
    //return edges.length;
  };

  rowRenderer = ({key, index, style}) => {
    const {styles, viewer, userId} = this.props;
    const edge = viewer.archivedProjects.edges[index];
    if (!edge) return undefined;
    const project = edge.node;
    return (
      <div className={css(styles.cardBlock)} key={`cardBlockFor${project.id}`} style={style}>
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
    )
  };

  render() {
    const {relay: {isLoading, hasMore, loadMore}, styles, teamId, teamName, userId, viewer} = this.props;
    const {archivedProjects} = viewer;
    const {edges} = archivedProjects;
    // Archive squeeze
    const isPaid = false; // Just on the Personal Plan
    const hasHiddenCards = true; // There are cards that have been archived for GT 14 days
    const showArchiveSqueeze = Boolean(!isPaid && hasHiddenCards);
    const handleUpdate = () => console.log(`handleUpdate to the Pro Plan for ${teamId}`);

    return (
      <div className={css(styles.root)}>
        <Helmet title={`${teamName} Archive | Parabol`}/>
        <div className={css(styles.header)}>
          <TeamArchiveHeader teamId={teamId}/>
          <div className={css(styles.border)}/>
        </div>

        <div className={css(styles.body)}>
          <div className={css(styles.scrollable)}>
            {edges.length ?
              <div className={css(styles.cardGrid)}>
                <InfiniteLoader
                  isRowLoaded={this.isRowLoaded}
                  loadMoreRows={this.loadMore}
                  rowCount={this.getRowCount()}
                >
                  {({onRowsRendered, registerChild}) => (
                    <List
                      height={600}
                      onRowsRendered={onRowsRendered}
                      ref={registerChild}
                      rowCount={this.getRowCount()}
                      rowHeight={100}
                      rowRenderer={this.rowRenderer}
                      width={1200}
                    />
                  )}
                </InfiniteLoader>
                {showArchiveSqueeze &&
                <div className={css(styles.archiveSqueezeBlock)}>
                  <TeamArchiveSqueeze cardsUnavailableCount={128} handleUpdate={handleUpdate}/>
                </div>
                }
              </div> :
              <div className={css(styles.emptyMsg)}>
                <FontAwesome name="smile-o" style={iconStyle}/>
                <span style={ib}>
                {'Hi there! There are zero archived projects. '}
                  {'Nothing to see here. How about a fun rally video? '}
                  <span className={css(styles.link)}>{getRallyLink()}!</span>
              </span>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
};

TeamArchive.propTypes = {
  styles: PropTypes.object,
  teamId: PropTypes.string,
  teamName: PropTypes.string,
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
    height: '1px',
    width: '100%'
  },

  body: {
    flex: 1,
    position: 'relative'
  },

  scrollable: {
    ...overflowTouch,
    bottom: 0,
    left: 0,
    padding: '1rem 0 0 1rem',
    // @terry everything was hidden unless i nuked this.
    //position: 'absolute',
    right: 0,
    top: 0
  },

  cardGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: ui.projectColumnsMaxWidth,
    width: '100%'
  },

  cardBlock: {
    flex: '0 0 100%',
    padding: '0 1rem .5rem 0',

    '@media (min-width: 40rem)': {
      flex: '0 0 50%'
    },

    '@media (min-width: 60rem)': {
      flex: '0 0 33.3333%'
    },

    '@media (min-width: 80rem)': {
      flex: '0 0 25%'
    },

    '@media (min-width: 100rem)': {
      flex: '0 0 20%'
    }
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
    paddingBottom: '1rem',
    paddingRight: '1rem',
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
