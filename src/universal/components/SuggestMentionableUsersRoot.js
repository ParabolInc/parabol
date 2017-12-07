import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import SuggestMentionableUsers from 'universal/components/SuggestMentionableUsers';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import TeamMemberAddedSubscription from 'universal/subscriptions/TeamMemberAddedSubscription';
import TeamMemberUpdatedSubscription from 'universal/subscriptions/TeamMemberUpdatedSubscription';
import {cacheConfig} from 'universal/utils/constants';

const query = graphql`
  query SuggestMentionableUsersRootQuery($teamId: ID!) {
    viewer {
      ...SuggestMentionableUsers_viewer
    }
  }
`;


const subscriptions = [
  TeamMemberAddedSubscription,
  TeamMemberUpdatedSubscription
];

const SuggestMentionableUsersRoot = (props) => {
  const {activeIdx, atmosphere, handleSelect, setSuggestions, suggestions, triggerWord, teamId} = props;
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
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps && <AnimatedFade key="1">
              <SuggestMentionableUsers
                activeIdx={activeIdx}
                handleSelect={handleSelect}
                setSuggestions={setSuggestions}
                suggestions={suggestions}
                triggerWord={triggerWord}
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

SuggestMentionableUsersRoot.propTypes = {
  activeIdx: PropTypes.number.isRequired,
  atmosphere: PropTypes.object.isRequired,
  handleSelect: PropTypes.func.isRequired,
  setSuggestions: PropTypes.func.isRequired,
  suggestions: PropTypes.array,
  triggerWord: PropTypes.string.isRequired,
  teamId: PropTypes.string.isRequired
};

export default withAtmosphere(SuggestMentionableUsersRoot);
