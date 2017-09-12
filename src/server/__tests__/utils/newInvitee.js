import shortid from 'shortid';

const newInvitee = () => ({
  email: `invitee@mockTeam+${shortid.generate()}.co`
});

export default newInvitee;
