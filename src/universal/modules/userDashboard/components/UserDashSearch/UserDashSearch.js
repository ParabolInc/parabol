import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {DashSearchControl} from 'universal/components/Dashboard';
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

class UserDashSearch extends Component {
  componentWillReceiveProps(nextProps) {
    const {viewer: {userId: oldUserId, contentFilter: oldContentFilter}} = this.props;
    if (oldUserId && oldContentFilter) {
      if (!nextProps.userId || nextProps.userId !== oldUserId) {
        this.setContentFilter('');
      }
    }
  }

  componentWillUnmount() {
    if (this.props.viewer.contentFilter) {
      this.setContentFilter('');
    }
  }

  setContentFilter(nextValue) {
    const {atmosphere, viewer: {userId}} = this.props;
    commitLocalUpdate(atmosphere, (store) => {
      const userProxy = store.get(userId);
      userProxy.setValue(nextValue, 'contentFilter');
    });
  }

  updateFilter = (e) => {
    this.setContentFilter(e.target.value);
  };

  render() {
    return (
      <DashSearchControl onChange={this.updateFilter} placeholder="Search My Tasks" />
    );
  }
}

UserDashSearch.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  userId: PropTypes.string,
  viewer: PropTypes.object
};

export default createFragmentContainer(
  withAtmosphere(UserDashSearch),
  graphql`
    fragment UserDashSearch_viewer on User {
      userId: id
      contentFilter
    }
  `
);
