import {convertFromRaw} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import NullCard from 'universal/components/NullCard/NullCard';
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer';
import {createFragmentContainer} from 'react-relay';

class NullableProject extends Component {
  static propTypes = {
    area: PropTypes.string,
    hasDragStyles: PropTypes.bool,
    handleAddProject: PropTypes.func,
    isAgenda: PropTypes.bool,
    isDragging: PropTypes.bool,
    myUserId: PropTypes.string,
    project: PropTypes.object
  };

  state = {
    contentState: convertFromRaw(JSON.parse(this.props.project.content))
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.project.content !== this.props.project.content) {
      this.setState({
        contentState: convertFromRaw(JSON.parse(nextProps.project.content))
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    return Boolean(!nextProps.isPreview ||
      nextProps.project.status !== this.props.project.status ||
      nextProps.project.content !== this.props.project.content
    );
  }

  render() {
    const {area, handleAddProject, hasDragStyles, isAgenda, myUserId, project, isDragging} = this.props;
    const {contentState} = this.state;
    const {createdBy, teamMember: {preferredName}} = project;
    const showOutcome = contentState.hasText() || createdBy === myUserId;
    return showOutcome ?
      <OutcomeCardContainer
        area={area}
        contentState={contentState}
        handleAddProject={handleAddProject}
        hasDragStyles={hasDragStyles}
        isDragging={isDragging}
        isAgenda={isAgenda}
        project={project}
        myUserId={myUserId}
      /> :
      <NullCard preferredName={preferredName} />;
  }
}

export default createFragmentContainer(
  NullableProject,
  graphql`
    fragment NullableProject_project on Project {
      content
      createdBy
      status
      teamMember {
        preferredName
      }
      ...OutcomeCardContainer_project
    }`
);
