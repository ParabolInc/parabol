import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import {PROJECT} from 'universal/utils/constants';
import {DragSource as dragSource, DropTarget as dropTarget} from 'react-dnd';
import {findDOMNode} from 'react-dom';

const projectSource = {
  beginDrag(props) {
    return {
      id: props.project.id,
      status: props.project.status,
      teamSort: props.project.teamSort,
      dragProject: props.dragProject
    };
  }
};

const projectTarget = {
  hover(targetProps, monitor, component) {
    const {project: {teamSort: targetTeamSort, id: targetId}} = targetProps;
    const sourceProps = monitor.getItem();
    const {dragProject, id: sourceId, teamSort: sourceTeamSort} = sourceProps;
    if (sourceId === targetId) return;
    // make dragging a little nicer
    const targetBoundingRect = findDOMNode(component).getBoundingClientRect();
    const targetMiddleY = targetBoundingRect.top + targetBoundingRect.height / 2;
    const sourceOffsetY = monitor.getClientOffset().y;
    if (sourceTeamSort > targetTeamSort && sourceOffsetY < targetMiddleY) {
      return;
    }
    if (sourceTeamSort < targetTeamSort && sourceOffsetY > targetMiddleY) {
      return;
    }
    dragProject(sourceProps, targetProps);
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

const ProjectCardContainer = (props) => {
  const {area, connectDragSource, connectDropTarget, isDragging, myUserId, project} = props;
  const {id, status} = project;
  const form = `${status}::${id}`;
  return connectDropTarget(connectDragSource(
    <div>
      <OutcomeOrNullCard
        area={area}
        form={form}
        outcome={project}
        myUserId={myUserId}
      />
    </div>
  ));
};


ProjectCardContainer.propTypes = {
  area: PropTypes.string,
  dispatch: PropTypes.func,
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

const dropTargetCb = (connectTarget) => ({
  connectDropTarget: connectTarget.dropTarget()
});

export default dragSource(PROJECT, projectSource, dragSourceCb)(
  dropTarget(PROJECT, projectTarget, dropTargetCb)(
    connect(mapStateToProps)(ProjectCardContainer)
  )
);
