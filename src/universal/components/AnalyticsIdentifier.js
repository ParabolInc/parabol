// @flow
/*
 * Currently, we only use this in the dashboard views, not the meeting views. That's probably OK for now, but not perfect.
 */
import PropTypes from 'prop-types';
import {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import {selectSegmentTraits} from 'universal/redux/segmentActions';
import raven from 'raven-js';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import type {AnalyticsIdentifier_viewer as Viewer} from './__generated__/AnalyticsIdentifier_viewer.graphql';

type Props = {
  viewer: Viewer
};

type State = {
  viewer: ?Viewer
}

class AnalyticsIdentifier extends Component<Props, State> {
  static propTypes = {
    viewer: PropTypes.object
  };

  static identify(viewer) {
    if (!viewer || !__PRODUCTION__) return;
    const {email, viewerId} = viewer;
    raven.setUserContext({
      id: viewerId,
      email
    });
    selectSegmentTraits(viewer);
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): $Shape<State> | null {
    const {viewer} = nextProps;
    if (!viewer || viewer === prevState.viewer) return null;

    // a little side-effecty, but if we didn't do this, we'd need to track isIdentified in the state
    AnalyticsIdentifier.identify(viewer);
    return {
      viewer
    };
  }

  state = {
    viewer: null
  }

  render() {
    return null;
  }
}

reactLifecyclesCompat(AnalyticsIdentifier);

export default createFragmentContainer(
  AnalyticsIdentifier,
  graphql`
    fragment AnalyticsIdentifier_viewer on User {
      viewerId: id
      createdAt
      picture
      preferredName
      email
    }
  `
);

