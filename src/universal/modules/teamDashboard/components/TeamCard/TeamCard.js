import React, {PropTypes} from 'react';
import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';
import CreateCard from 'universal/components/CreateCard/CreateCard';

const TeamCard = (props) => {
  const {project, teamMembers, teamMemberId} = props;
  const {id, content, status, updatedAt} = project;
  const owner = teamMembers.find(m => m.id === project.teamMemberId);
  const isOutcome = content || owner.id === teamMemberId;
  /**
   * Why generate a form id with the status included? If we move a card
   * by updating it's status, it will unmount the component as it
   * moves columns. redux-form will dispatch a redux-form/DESTROY
   * action asynchronously. If we were to use only the projectId as the
   * form id, this would destroy our form and our forms data. Ouch!
   * So, instead each column gets it's own unique form id.
   */
  const formId = `${id}::${status}`;
  return (
    isOutcome ?
      <OutcomeCard
        content={content}
        form={formId}
        status={status}
        isProject
        owner={owner}
        projectId={id}
        teamMembers={teamMembers}
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
