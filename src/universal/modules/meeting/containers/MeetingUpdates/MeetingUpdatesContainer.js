import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import MeetingUpdates from 'universal/modules/meeting/components/MeetingUpdates/MeetingUpdates';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import ProjectUpdatedSubscription from 'universal/subscriptions/ProjectUpdatedSubscription';
import ProjectCreatedSubscription from 'universal/subscriptions/ProjectCreatedSubscription';
import ProjectDeletedSubscription from 'universal/subscriptions/ProjectDeletedSubscription';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import ms from 'ms';
import {TransitionGroup} from 'react-transition-group';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import AnimatedFade from 'universal/components/AnimatedFade';

const query = graphql`
  query MeetingUpdatesRootQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        hideAgenda
      }
      ...MeetingUpdates_viewer
    }
  }
`;

const subscriptions = [
  ProjectUpdatedSubscription,
  ProjectCreatedSubscription,
  ProjectDeletedSubscription
];

const meetingUpdatesQuery = `
query {
  projects(teamMemberId: $teamMemberId) @live {
    id
    content
    createdAt
    createdBy
    integration {
      service
      nameWithOwner
      issueNumber
    }
    status
    tags
    teamMemberId
    updatedAt
    sortOrder
    team @cached(type: "Team") {
      id
      name
    }
    teamMember @cached(type: "TeamMember") {
      id
      picture
      preferredName
    }
  }
}
`;

const mapStateToProps = (state, props) => {
  const {members, localPhaseItem} = props;
  const currentTeamMember = members[localPhaseItem - 1];
  const teamMemberId = currentTeamMember && currentTeamMember.id;
  const memberProjects = cashay.query(meetingUpdatesQuery, {
    op: 'meetingUpdatesContainer',
    key: teamMemberId,
    mutationHandlers,
    variables: {teamMemberId},
    filter: {
      projects: (project) => !project.tags.includes('private')
    },
    resolveCached: {
      teamMember: (source) => source.teamMemberId,
      team: (source) => source.teamMemberId.split('::')[1]
    }
  }).data.projects;
  const projects = makeProjectsByStatus(memberProjects);
  return {
    projects
  };
};
const cacheConfig = {ttl: ms('30s')};
const MeetingUpdatesContainer = (props) => {
  const {atmosphere, gotoItem, gotoNext, showMoveMeetingControls, teamId} = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear style={{display: 'flex', width: '100%', flex: 1}} exit={false}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
            <AnimatedFade key="1">
              <MeetingUpdates
                gotoItem={gotoItem}
                gotoNext={gotoNext}
                showMoveMeetingControls={showMoveMeetingControls}
                {...props}
              />
            </AnimatedFade>
            }
            {!renderProps && !error &&
            <AnimatedFade key="2" unmountOnExit exit={false}>
              <LoadingComponent height={'5rem'} />
            </AnimatedFade>
            }
          </TransitionGroup>
        );
      }}
    />
  );
};

MeetingUpdatesContainer.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired,
  projects: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired
};

export default withAtmosphere(MeetingUpdatesContainer);
