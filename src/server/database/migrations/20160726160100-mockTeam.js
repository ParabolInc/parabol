import {LOBBY} from '../../../universal/utils/constants';

/* eslint-disable max-len */
exports.up = async(r) => {
  const users = [
    {
      id: 'auth0|5797eb5d12664ba4675745b9',
      email: 'taya@prbl.co',
      isNew: false,
      picture: 'http://static1.squarespace.com/static/5654d81ce4b0e1e5861165b7/565e0e3ce4b0f01662c88e7c/565e0e75e4b0e38c74d38ed3/1468511235959/tm-linkedin-avatar-baw.jpg',
      preferredName: 'taya'
    },
    {
      id: 'auth0|57a8fb6cab6c18473e47f518',
      email: 'jordan@prbl.co',
      isNew: false,
      picture: 'http://static1.squarespace.com/static/5654d81ce4b0e1e5861165b7/565e0e3ce4b0f01662c88e7c/565e0e75e4b0e38c74d38ecd/1468511229451/jh-linkedin-avatar.jpg',
      preferredName: 'jordan'
    },
    {
      id: 'auth0|5797e83170dddc395d8d1675',
      email: 'terry@prbl.co',
      isNew: false,
      picture: 'http://static1.squarespace.com/static/5654d81ce4b0e1e5861165b7/565e0e3ce4b0f01662c88e7c/565e0e75e4b0a880d2eda25f/1468510094892/ta-linkedin-avatar.jpg',
      preferredName: 'terry'
    },
    {
      id: 'auth0|5797eb9712664ba4675745c3',
      email: 'matt@prbl.co',
      isNew: false,
      picture: 'http://static1.squarespace.com/static/5654d81ce4b0e1e5861165b7/565e0e3ce4b0f01662c88e7c/565e0e75e4b0e38c74d38ed1/1468510141040/_DSC4863.png',
      preferredName: 'matt'
    }
  ];
  const team = {
    id: 'team123',
    name: 'Parabol',
    facilitatorPhase: LOBBY,
    meetingPhase: LOBBY,
    meetingId: null,
    facilitatorPhaseItem: null,
    meetingPhaseItem: null,
    activeFacilitator: null
  };
  const teamMembers = [
    {
      id: 'jordan123',
      isActive: true,
      isFacilitator: true,
      isLead: true,
      teamId: 'team123',
      userId: 'auth0|57a8fb6cab6c18473e47f518',
      picture: 'http://static1.squarespace.com/static/5654d81ce4b0e1e5861165b7/565e0e3ce4b0f01662c88e7c/565e0e75e4b0e38c74d38ecd/1468511229451/jh-linkedin-avatar.jpg',
      preferredName: 'jordan'
    },
    {
      id: 'terry123',
      isActive: true,
      isFacilitator: true,
      isLead: false,
      teamId: 'team123',
      userId: 'auth0|5797e83170dddc395d8d1675',
      picture: 'http://static1.squarespace.com/static/5654d81ce4b0e1e5861165b7/565e0e3ce4b0f01662c88e7c/565e0e75e4b0a880d2eda25f/1468510094892/ta-linkedin-avatar.jpg',
      preferredName: 'terry'
    },
    {
      id: 'taya123',
      isActive: true,
      isFacilitator: false,
      isLead: false,
      teamId: 'team123',
      userId: 'auth0|5797eb5d12664ba4675745b9',
      picture: 'http://static1.squarespace.com/static/5654d81ce4b0e1e5861165b7/565e0e3ce4b0f01662c88e7c/565e0e75e4b0e38c74d38ed3/1468511235959/tm-linkedin-avatar-baw.jpg',
      preferredName: 'taya'
    },
    {
      id: 'matt123',
      isActive: true,
      isFacilitator: true,
      isLead: true,
      teamId: 'team123',
      userId: 'auth0|5797eb9712664ba4675745c3',
      picture: 'http://static1.squarespace.com/static/5654d81ce4b0e1e5861165b7/565e0e3ce4b0f01662c88e7c/565e0e75e4b0e38c74d38ed1/1468510141040/_DSC4863.png',
      preferredName: 'matt'
    }
  ];
  const mockUsers = [
    r.table('User').insert(users),
    r.table('Team').insert(team),
    r.table('TeamMember').insert(teamMembers)
  ];
  await Promise.all(mockUsers);
};

exports.down = async(r) => {
  const meetingTables = [
    r.table('User').delete(),
    r.table('TeamMember').delete(),
    r.table('Team').delete()
  ];
  return await Promise.all(meetingTables);
};
