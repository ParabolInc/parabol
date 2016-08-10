import React, {PropTypes} from 'react';
import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import fromNow from 'universal/utils/fromNow';

const TeamCard = (props) => {
  const {project, teamMembers, teamMemberId} = props;
  const {content, status, updatedAt} = project;
  const owner = teamMembers.find(m => m.id === project.teamMemberId);
  const isOutcome = content || owner.id === teamMemberId;
  return (
    isOutcome ?
      <OutcomeCard
        content={content}
        status={status}
        isProject
        owner={owner}
        timestamp={fromNow(updatedAt)}
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
    updatedAt: PropTypes.number
  }),
  teamMembers: PropTypes.array,
  teamMemberId: PropTypes.string
};

export default TeamCard;
