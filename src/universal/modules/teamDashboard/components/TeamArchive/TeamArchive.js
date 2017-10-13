import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {ib, overflowTouch} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import TeamArchiveHeader from 'universal/modules/teamDashboard/components/TeamArchiveHeader/TeamArchiveHeader';
import TeamArchiveSqueeze from 'universal/modules/teamDashboard/components/TeamArchiveSqueeze/TeamArchiveSqueeze';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import FontAwesome from 'react-fontawesome';
import getRallyLink from 'universal/modules/userDashboard/helpers/getRallyLink';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import {TEAM_DASH} from 'universal/utils/constants';
import {createPaginationContainer} from 'react-relay';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const iconStyle = {
  ...ib,
  fontSize: ui.iconSize,
  marginRight: '.25rem'
};

const TeamArchive = (props) => {
  const {styles, teamId, teamName, userId, viewer} = props;
  const {archivedProjects} = viewer;
  const {edges} = archivedProjects;
  // Archive squeeze
  const isPaid = false; // Just on the Personal Plan
  const hasHiddenCards = true; // There are cards that have been archived for GT 14 days
  const showArchiveSqueeze = Boolean(!isPaid && hasHiddenCards);
  const handleUpdate = () => console.log(`handleUpdate to the Pro Plan for ${teamId}`);

  return (
    <div className={css(styles.root)}>
      <Helmet title={`${teamName} Archive | Parabol`} />
      <div className={css(styles.header)}>
        <TeamArchiveHeader teamId={teamId} />
        <div className={css(styles.border)} />
      </div>
      <div className={css(styles.body)}>
        <div className={css(styles.scrollable)}>
          {edges.length ?
            <div className={css(styles.cardGrid)}>
              {edges.map(({node: project}) =>
                (<div className={css(styles.cardBlock)} key={`cardBlockFor${project.id}`}>
                  <OutcomeOrNullCard
                    key={project.id}
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
                </div>)
              )}
              {showArchiveSqueeze &&
                <div className={css(styles.archiveSqueezeBlock)}>
                  <TeamArchiveSqueeze cardsUnavailableCount={128} handleUpdate={handleUpdate} />
                </div>
              }
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
        </div>
      </div>
    </div>
  );
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
