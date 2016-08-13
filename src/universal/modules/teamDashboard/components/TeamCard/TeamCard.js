import React, {PropTypes} from 'react';
import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';
import CreateCard from 'universal/components/CreateCard/CreateCard';

const TeamCard = (props) => {
  const {project, teamMembers, teamMemberId} = props;
  const {id, content, status, updatedAt} = project;
  const owner = teamMembers.find(m => m.id === project.teamMemberId);
  const isOutcome = content || owner.id === teamMemberId;
  return (
    isOutcome ?
      <OutcomeCard
        content={content}
        form={id}
        status={status}
        isProject
        owner={owner}
        projectId={id}
        updatedAt={updatedAt}
      /> :
      <CreateCard
        isProject
        isCreating
        createdBy={owner.preferredName}
      />
  );
};

TeamCard.propTypes = {
  project: PropTypes.shape({
    content: PropTypes.string,
    status: PropTypes.string,
    updatedAt: PropTypes.instanceOf(Date)
  }),
  teamMembers: PropTypes.array,
  teamMemberId: PropTypes.string
};

export default TeamCard;
