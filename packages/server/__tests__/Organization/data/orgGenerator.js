import Chance from 'chance'
import shortid from 'shortid'
import testOrgMember from './testOrgMember'

function randomTeamMember () {
  const chance = new Chance()
  return testOrgMember({
    id: `jest|${shortid()}`,
    name: chance.name(),
    email: chance.email(),
    nickname: chance.first(),
    picture: chance.avatar({protocol: 'https'})
  })
}

export default function (numTeamMembers = 1) {
  const chance = new Chance()
  const billingLeader = randomTeamMember()
  const otherTeamMembers = [...Array(numTeamMembers)].map(() => randomTeamMember())
  const orgId = shortid.generate()
  const team = {
    id: shortid(),
    name: chance.word().replace(/^./, (s) => s.toUpperCase()),
    orgId
  }
  return {
    allTeamMembers: [billingLeader, ...otherTeamMembers],
    billingLeader,
    otherTeamMembers,
    team,
    org: {
      id: orgId,
      name: `${billingLeader.name}'s org`
    }
  }
}
