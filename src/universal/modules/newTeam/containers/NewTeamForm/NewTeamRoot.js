import PropTypes from 'prop-types';
import React from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import NewTeam from 'universal/modules/newTeam/NewTeam';

const query = graphql`
  query NewTeamRootQuery {
    viewer {
      ...NewTeam_viewer
    }
  }
`;

const NewTeamRoot = ({atmosphere, match: {params: {defaultOrgId}}}) => {
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear style={{overflow: 'hidden'}}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps && <AnimatedFade key="1">
              <NewTeam
                defaultOrgId={defaultOrgId}
                viewer={renderProps.viewer}
              />
            </AnimatedFade>}
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


NewTeamRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default withAtmosphere(NewTeamRoot);
