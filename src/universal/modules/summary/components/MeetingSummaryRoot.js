import PropTypes from 'prop-types';
import React from 'react';
import {withRouter} from 'react-router-dom';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingSummary from 'universal/modules/summary/components/MeetingSummary';

const query = graphql`
  query MeetingSummaryRootQuery($meetingId: ID!) {
    viewer {
      ...MeetingSummary_viewer
    }
  }
`;

const MeetingSummaryRoot = ({atmosphere, match}) => {
  const {params: {meetingId}} = match;
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId}}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear component={null}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
            <AnimatedFade key="1">
              <MeetingSummary
                viewer={renderProps.viewer}
              />
            </AnimatedFade>
            }
            {!renderProps && !error &&
            <AnimatedFade key="2" unmountOnExit exit={false}>
              <LoadingView />
            </AnimatedFade>
            }
          </TransitionGroup>
        );
      }}
    />
  );
};

MeetingSummaryRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default withAtmosphere(withRouter(MeetingSummaryRoot));
