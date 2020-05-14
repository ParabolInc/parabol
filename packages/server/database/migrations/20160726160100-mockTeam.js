import { LOBBY } from 'parabol-client/utils/constants'

/* eslint-disable max-len */
exports.up = async (r) => {
  const users = [
    {
      id: 'auth0|5ad184ad6d59890e8635d9e4',
      email: 'taya@prbl.co',
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/2016+Taya+Mueller.jpg?t=1523658193243',
      preferredName: 'Taya'
    },
    {
      id: 'auth0|5ad119debcb4500e4f4e2808',
      email: 'jordan@prbl.co',
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/2016+Jordan+Husney.jpg?t=1523658193243',
      preferredName: 'Jordan'
    },
    {
      id: 'auth0|5ad184fabcb4500e4f4e345e',
      email: 'terry@prbl.co',
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/terry.jpg?t=1523658193243',
      preferredName: 'Terry'
    },
    {
      id: 'auth0|5ad1851a6d59890e8635d9eb',
      email: 'matt@prbl.co',
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/matt.jpg?t=1523658193243',
      preferredName: 'Matt'
    }
  ]
  const team = {
    id: 'team123',
    name: 'Parabol',
    facilitatorPhase: LOBBY,
    meetingPhase: LOBBY,
    meetingId: null,
    facilitatorPhaseItem: null,
    meetingPhaseItem: null,
    activeFacilitator: null
  }
  const teamMembers = [
    {
      id: 'auth0|5ad119debcb4500e4f4e2808::team123',
      isActive: true,
      isFacilitator: true,
      isLead: true,
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/2016+Jordan+Husney.jpg?t=1523658193243',
      preferredName: 'Jordan',
      teamId: 'team123',
      userId: 'auth0|5ad119debcb4500e4f4e2808'
    },
    {
      id: 'auth0|5ad184fabcb4500e4f4e345e::team123',
      isActive: true,
      isFacilitator: true,
      isLead: false,
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/terry.jpg?t=1523658193243',
      preferredName: 'Terry',
      teamId: 'team123',
      userId: 'auth0|5ad184fabcb4500e4f4e345e'
    },
    {
      id: 'auth0|5ad184ad6d59890e8635d9e4::team123',
      isActive: true,
      isFacilitator: true,
      isLead: false,
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/2016+Taya+Mueller.jpg?t=1523658193243',
      preferredName: 'Taya',
      teamId: 'team123',
      userId: 'auth0|5ad184ad6d59890e8635d9e4'
    },
    {
      id: 'auth0|5ad1851a6d59890e8635d9eb::team123',
      isActive: true,
      isFacilitator: true,
      isLead: false,
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/matt.jpg?t=1523658193243',
      preferredName: 'Matt',
      teamId: 'team123',
      userId: 'auth0|5ad1851a6d59890e8635d9eb'
    }
  ]
  const engineeringTeam = {
    id: 'team456',
    name: 'Engineering',
    facilitatorPhase: LOBBY,
    meetingPhase: LOBBY,
    meetingId: null,
    facilitatorPhaseItem: null,
    meetingPhaseItem: null,
    activeFacilitator: null
  }
  const engineeringMembers = [
    {
      id: 'auth0|5ad119debcb4500e4f4e2808::team456',
      isActive: true,
      isFacilitator: true,
      isLead: false,
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/2016+Jordan+Husney.jpg?t=1523658193243',
      preferredName: 'Jordan',
      teamId: 'team456',
      userId: 'auth0|5ad119debcb4500e4f4e2808'
    },
    {
      id: 'auth0|5ad184fabcb4500e4f4e345e::team456',
      isActive: false,
      isFacilitator: true,
      isLead: false,
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/terry.jpg?t=1523658193243',
      preferredName: 'Terry',
      teamId: 'team456',
      userId: 'auth0|5ad184fabcb4500e4f4e345e'
    },
    {
      id: 'auth0|5ad1851a6d59890e8635d9eb::team456',
      isActive: true,
      isFacilitator: true,
      isLead: true,
      picture:
        'https://www.parabol.co/hubfs/website/2018-01/assets/dist/images/team/matt.jpg?t=1523658193243',
      preferredName: 'Matt',
      teamId: 'team456',
      userId: 'auth0|5ad1851a6d59890e8635d9eb'
    }
  ]
  const mockUsers = [
    r
      .table('User')
      .insert(users)
      .run(),
    r
      .table('Team')
      .insert(team)
      .run(),
    r
      .table('Team')
      .insert(engineeringTeam)
      .run(),
    r
      .table('TeamMember')
      .insert(teamMembers)
      .run(),
    r
      .table('TeamMember')
      .insert(engineeringMembers)
      .run()
  ]
  await Promise.all(mockUsers)
}

exports.down = async (r) => {
  const meetingTables = [
    r
      .table('User')
      .delete()
      .run(),
    r
      .table('TeamMember')
      .delete()
      .run(),
    r
      .table('Team')
      .delete()
      .run()
  ]
  await Promise.all(meetingTables)
}
