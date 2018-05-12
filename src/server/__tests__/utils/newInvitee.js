import shortid from 'shortid'

const newInvitee = (randSeed) => ({
  email: `invitee@mockTeam+${randSeed || shortid.generate()}.co`
})

export default newInvitee
