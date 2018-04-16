import PropTypes from 'prop-types';
import React from 'react';
import {withRouter} from 'react-router-dom';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import NewMeetingSummary from 'universal/modules/summary/components/NewMeetingSummary';

const query = graphql`
  query NewMeetingSummaryRootQuery($meetingId: ID!) {
    viewer {
      ...NewMeetingSummary_viewer
    }
  }
`;

const NewMeetingSummaryRoot = ({atmosphere, match}) => {
  const {params: {meetingId}} = match;
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight="50vh" />}
          ready={<NewMeetingSummary />}
        />
      )}
    />
  );
};

NewMeetingSummaryRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default withAtmosphere(withRouter(NewMeetingSummaryRoot));
