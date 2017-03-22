import {LOBBY} from '../../../universal/utils/constants';

/* eslint-disable max-len */
exports.up = async (r) => {
  const users = [
    {
      id: 'auth0|5797eb5d12664ba4675745b9',
      email: 'taya@prbl.co',
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/58264149ff7c5065482011ce/1478902205921/2016+Taya+Mueller.jpg?format=300w',
      preferredName: 'taya'
    },
    {
      id: 'auth0|58a861e682b0ca077463c577',
      email: 'jordan@prbl.co',
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/5826412fff7c506548200d81/1478902214166/2016+Jordan+Husney.jpg?format=300w',
      preferredName: 'jordan'
    },
    {
      id: 'auth0|5797e83170dddc395d8d1675',
      email: 'terry@prbl.co',
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/58264194ff7c506548201522/1478902180686/2016+Terry+Acker.png?format=300w',
      preferredName: 'terry'
    },
    {
      id: 'auth0|5797eb9712664ba4675745c3',
      email: 'matt@prbl.co',
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/5826415aff7c506548201290/1478902195409/2016+Matt+Krick.png?format=300w',
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
      id: 'auth0|58a861e682b0ca077463c577::team123',
      isActive: true,
      isFacilitator: true,
      isLead: true,
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/5826412fff7c506548200d81/1478902214166/2016+Jordan+Husney.jpg?format=300w',
      preferredName: 'jordan',
      teamId: 'team123',
      userId: 'auth0|58a861e682b0ca077463c577'
    },
    {
      id: 'auth0|5797e83170dddc395d8d1675::team123',
      isActive: true,
      isFacilitator: true,
      isLead: false,
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/58264194ff7c506548201522/1478902180686/2016+Terry+Acker.png?format=300w',
      preferredName: 'terry',
      teamId: 'team123',
      userId: 'auth0|5797e83170dddc395d8d1675'
    },
    {
      id: 'auth0|5797eb5d12664ba4675745b9::team123',
      isActive: true,
      isFacilitator: true,
      isLead: false,
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/58264149ff7c5065482011ce/1478902205921/2016+Taya+Mueller.jpg?format=300w',
      preferredName: 'taya',
      teamId: 'team123',
      userId: 'auth0|5797eb5d12664ba4675745b9'
    },
    {
      id: 'auth0|5797eb9712664ba4675745c3::team123',
      isActive: true,
      isFacilitator: true,
      isLead: false,
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/5826415aff7c506548201290/1478902195409/2016+Matt+Krick.png?format=300w',
      preferredName: 'matt',
      teamId: 'team123',
      userId: 'auth0|5797eb9712664ba4675745c3'
    }
  ];
  const engineeringTeam = {
    id: 'team456',
    name: 'Engineering',
    facilitatorPhase: LOBBY,
    meetingPhase: LOBBY,
    meetingId: null,
    facilitatorPhaseItem: null,
    meetingPhaseItem: null,
    activeFacilitator: null
  };
  const engineeringMembers = [
    {
      id: 'auth0|58a861e682b0ca077463c577::team456',
      isActive: true,
      isFacilitator: true,
      isLead: false,
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/5826412fff7c506548200d81/1478902214166/2016+Jordan+Husney.jpg?format=300w',
      preferredName: 'jordan',
      teamId: 'team456',
      userId: 'auth0|58a861e682b0ca077463c577'
    },
    {
      id: 'auth0|5797e83170dddc395d8d1675::team456',
      isActive: false,
      isFacilitator: true,
      isLead: false,
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/58264194ff7c506548201522/1478902180686/2016+Terry+Acker.png?format=300w',
      preferredName: 'terry',
      teamId: 'team456',
      userId: 'auth0|5797e83170dddc395d8d1675'
    },
    {
      id: 'auth0|5797eb9712664ba4675745c3::team456',
      isActive: true,
      isFacilitator: true,
      isLead: true,
      picture: 'https://static1.squarespace.com/static/58236748893fc00a1fffd879/t/5826415aff7c506548201290/1478902195409/2016+Matt+Krick.png?format=300w',
      preferredName: 'matt',
      teamId: 'team456',
      userId: 'auth0|5797eb9712664ba4675745c3'
    }
  ];
  const mockUsers = [
    r.table('User').insert(users),
    r.table('Team').insert(team),
    r.table('Team').insert(engineeringTeam),
    r.table('TeamMember').insert(teamMembers),
    r.table('TeamMember').insert(engineeringMembers)
  ];
  await Promise.all(mockUsers);
};

exports.down = async (r) => {
  const meetingTables = [
    r.table('User').delete(),
    r.table('TeamMember').delete(),
    r.table('Team').delete()
  ];
  await Promise.all(meetingTables);
};
