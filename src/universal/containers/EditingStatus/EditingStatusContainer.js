import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import EditingStatus from 'universal/components/EditingStatus/EditingStatus';
import getRefreshPeriod from 'universal/utils/getRefreshPeriod';

class EditingStatusContainer extends Component {
  static propTypes = {
    isEditing: PropTypes.bool,
    project: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      timestampType: 'createdAt'
    };
  }

  componentWillUnmount() {
    this.resetTimeout();
  }

  toggleTimestamp = () => {
    const timestampType = this.state.timestampType === 'createdAt' ? 'updatedAt' : 'createdAt';
    this.setState({timestampType});
  };

  resetTimeout() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = undefined;
  }

  queueNextRender() {
    this.resetTimeout();
    const {project: {createdAt, updatedAt}} = this.props;
    const timestamp = this.state.timestampType === 'createdAt' ? createdAt : updatedAt;
    const timeTilRefresh = getRefreshPeriod(timestamp);
    this.refreshTimer = setTimeout(() => {
      this.forceUpdate();
    }, timeTilRefresh);
  }

  render() {
    const {isEditing, project} = this.props;
    const {createdAt, updatedAt} = project;
    const {timestampType} = this.state;
    this.queueNextRender();
    const timestamp = timestampType === 'createdAt' ? createdAt : updatedAt;
    return (
      <EditingStatus
        handleClick={this.toggleTimestamp}
        isEditing={isEditing}
        project={project}
        timestamp={timestamp}
        timestampType={timestampType}
      />
    );
  }
}

export default createFragmentContainer(
  EditingStatusContainer,
  graphql`
    fragment EditingStatusContainer_project on Project {
      createdAt
      updatedAt
      ...EditingStatus_project
    }`
);
