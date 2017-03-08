import legitify from 'universal/validation/legitify';

export default function createActionValidation(tms) {
  return legitify({
    id: (value) => value
      .test((id) => {
        const [teamId] = id.split('::');
        return !tms.includes(teamId) && `Not on team ${teamId}`;
      }),
    agendaId: (value) => value
      .test((id) => {
        if (!id) return undefined;
        const [teamId] = id.split('::');
        return !tms.includes(teamId) && `Not on team ${teamId}`;
      }),
    content: (value) => value
      .trim()
      .max(255, 'Whoa! That looks like 2 actions'),
    isComplete: (value) => value.boolean(),
    sortOrder: (value) => value.float(),
    // required for actions created in meetings
    teamMemberId: (value) => value
      .test((id) => {
        if (!id) return undefined;
        const [, teamId] = id.split('::');
        return !tms.includes(teamId) && `Not on team ${teamId}`;
      })
  });
}
