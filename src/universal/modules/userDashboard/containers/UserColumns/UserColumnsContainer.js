import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import {USER_DASH} from 'universal/utils/constants';

const UserColumnsContainer = (props) => {
  const {viewer: {projects}, teams, userId} = props;
  return (
    <ProjectColumns
      projects={projects}
      area={USER_DASH}
      teams={teams}
      userId={userId}
    />
  );
};

UserColumnsContainer.propTypes = {
  projects: PropTypes.object,
  teams: PropTypes.array,
  userId: PropTypes.string,
  viewer: PropTypes.object
};


export default createFragmentContainer(
  UserColumnsContainer,
  graphql`
    fragment UserColumnsContainer_viewer on User {
      projects(first: 1000) @connection(key: "UserColumnsContainer_projects") {
        edges {
          node {
            # grab these so we can sort correctly
            id
            status
            sortOrder
            ...DraggableProject_project
          }
        }
      }
    }
  `
);
