import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OutcomeCardAssignMenu from 'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/OutcomeCardAssignMenu';
import TeamMemberAddedSubscription from 'universal/subscriptions/TeamMemberAddedSubscription';
import TeamMemberUpdatedSubscription from 'universal/subscriptions/TeamMemberUpdatedSubscription';
import {cacheConfig} from 'universal/utils/constants';

const query = graphql`
  query OutcomeCardAssignMenuRootQuery($teamId: ID!) {
    viewer {
      ...OutcomeCardAssignMenu_viewer
    }
  }
`;


const subscriptions = [
  TeamMemberAddedSubscription,
  TeamMemberUpdatedSubscription
];

const OutcomeCardAssignMenuRoot = (props) => {
  const {area, atmosphere, closePortal, project, teamId} = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear component={null}>
            {error && <ErrorComponent height={'14rem'} error={error}/>}
            {renderProps && <AnimatedFade key="1">
              <OutcomeCardAssignMenu
                area={area}
                closePortal={closePortal}
                project={project}
                viewer={renderProps.viewer}
              />
            </AnimatedFade>}
            {!renderProps && !error &&
            <AnimatedFade key="2" unmountOnExit exit={false}>
              <LoadingComponent height={'5rem'}/>
            </AnimatedFade>
            }
          </TransitionGroup>
        );
      }}
    />
  );
};

OutcomeCardAssignMenuRoot.propTypes = {
  area: PropTypes.string.isRequired,
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired
};

export default withAtmosphere(OutcomeCardAssignMenuRoot);
