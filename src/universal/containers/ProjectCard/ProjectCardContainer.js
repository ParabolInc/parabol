import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer';

// TODO merge this into OutcomeCardContainer
const projectCardSubQuery = `
query {
  project @cached(type: "Project") {
    content
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
}
`;

const mapStateToProps = (state, props) => {
  const projectId = props.project.id;
  const {project} = cashay.query(projectCardSubQuery, {
    op: 'projectCardContainer',
    key: projectId,
    variables: {projectId},
    resolveCached: {
      project: () => projectId,
      team: (source) => (doc) => source.id.startsWith(doc.id),
      // example of returning a string instead of a function so it runs in O(1)
      teamMember: (source) => source.teamMemberId
    },
  }).data;
  return {
    project
  };
};

const ProjectCardContainer = (props) => {
  const {area, project} = props;
  const {id, status} = project;
  const form = `${status}::${id}`;
  return (
    <OutcomeCardContainer
      area={area}
      form={form}
      outcome={project}
    />
  );
};


ProjectCardContainer.propTypes = {
  area: PropTypes.string,
  dispatch: PropTypes.func,
  myTeamMemberId: PropTypes.string,
  preferredName: PropTypes.string,
  username: PropTypes.string,
  project: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

export default connect(mapStateToProps)(ProjectCardContainer);
