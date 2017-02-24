import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import {PROJECT} from 'universal/utils/constants';
import {DragSource as dragSource} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import ProjectDragLayer from './ProjectDragLayer';

const projectSource = {
  beginDrag(props) {
    return {
      id: props.project.id,
      status: props.project.status
    };
  },
  isDragging(props, monitor) {
    return props.project.id === monitor.getItem().id;
  }
};

const projectCardSubQuery = `
query {
  project @cached(type: "Project") {
    content
    createdBy
    id
    status
    teamMemberId
    updatedAt
    teamMember @cached(type: "TeamMember") {
      id
      picture
      preferredName
    }
    team @cached(type: "Team") {
      id
      name
    }
  }
  user @cached(type: "User") {
    id
  }
}
`;

const mapStateToProps = (state, props) => {
  const projectId = props.project.id;
  const {project, user} = cashay.query(projectCardSubQuery, {
    op: 'projectCardContainer',
    key: projectId,
    variables: {projectId},
    resolveCached: {
      project: () => projectId,
      team: (source) => (doc) => source.id.startsWith(doc.id),
      // example of returning a string instead of a function so it runs in O(1)
      teamMember: (source) => source.teamMemberId,
      user: () => () => true
    },
  }).data;
  return {
    project,
    myUserId: user.id
  };
};

class ProjectCardContainer extends Component {
  componentDidMount() {
    const {connectDragPreview, isPreview} = this.props;
    if (!isPreview) {
      connectDragPreview(getEmptyImage());
    }
  }

  render() {
    const {area, connectDragSource, isDragging, myUserId, project} = this.props;
    return connectDragSource(
      <div>
        {isDragging &&
          <ProjectDragLayer
            area={area}
            form={project.id}
            outcome={project}
          />
        }
        <div style={{opacity: isDragging ? 0.5 : 1}}>
          <OutcomeOrNullCard
            area={area}
            form={project.id}
            outcome={project}
            myUserId={myUserId}
          />
        </div>
      </div>
    );
  }
}


ProjectCardContainer.propTypes = {
  area: PropTypes.string,
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  dispatch: PropTypes.func,
  isDragging: PropTypes.bool,
  isPreview: PropTypes.bool,
  myUserId: PropTypes.string,
  preferredName: PropTypes.string,
  username: PropTypes.string,
  project: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

const dragSourceCb = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
});

export default dragSource(PROJECT, projectSource, dragSourceCb)(
  connect(mapStateToProps)(ProjectCardContainer)
);
