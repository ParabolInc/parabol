import React from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import AgendaAndProjects from 'universal/modules/teamDashboard/components/AgendaAndProjects/AgendaAndProjects';
import {cacheConfig} from 'universal/utils/constants';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {withRouter} from 'react-router-dom';

const query = graphql`
  query AgendaAndProjectsRootQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        hideAgenda
      }
      ...AgendaAndProjects_viewer
    }
  }
`;

// const subscriptions = [];

const AgendaAndProjectsRoot = (props) => {
  const {atmosphere, match: {params: {teamId}}, teams} = props;
  return (
      <QueryRenderer
        cacheConfig={cacheConfig}
        environment={atmosphere}
        query={query}
        variables={{teamId}}
        // subscriptions={subscriptions}
        render={({error, props: renderProps, loading}) => {

          if (!renderProps && !loading) {
            return null
          }

          return (
            <TransitionGroup appear style={{display: 'flex', width: '100%', flex: 1}} exit={false}>
              {error && <ErrorComponent height={'14rem'} error={error}/>}
              {renderProps &&
              <AnimatedFade key="1">
                <AgendaAndProjects
                  teamId={teamId}
                  teams={teams}
                  viewer={renderProps.viewer}
                />
              </AnimatedFade>
              }
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

export default withRouter(withAtmosphere(AgendaAndProjectsRoot));
