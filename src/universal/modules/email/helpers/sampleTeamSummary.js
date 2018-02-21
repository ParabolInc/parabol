const avatarJordan = '/static/images/avatars/jh-linkedin-avatar.jpg';
const avatarMatt = '/static/images/avatars/matt-krick-bw.png';
const avatarMarimar = '/static/images/avatars/marimar-suarez-penalva.jpg';
const avatarTaya = '/static/images/avatars/taya-mueller-avatar.jpg';
const avatarTerry = '/static/images/avatars/terry-acker-avatar.jpg';

const Jordan = {
  avatar: avatarJordan,
  name: 'Jordan Husney',
  present: true,
  outcomesX: [],
  outcomes: [
    {
      content: 'Summary email designed',
      status: 'done',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Summary email implemented',
      status: 'active',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Summary view designed',
      status: 'active',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Summary view implemented',
      status: 'stuck',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Task column empty states implemented with great skill',
      status: 'stuck',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Summary updates shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    },
    {
      content: 'User dashboard updates shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    },
    {
      content: 'Task column empty states shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    }
  ]
};

const Marimar = {
  avatar: avatarMarimar,
  name: 'Marimar Suárez Peñalva',
  present: true,
  outcomes: []
};

// const Jerry = {
//   avatar: avatarTerry,
//   name: 'Jerry Seabass',
//   present: false,
//   outcomesX: [],
//   outcomes: [
//     {
//       content: 'First consultant client signed',
//       status: 'active',
//       team: 'Parabol',
//       type: 'task'
//     },
//     {
//       content: 'Accelerator acceptance received',
//       status: 'active',
//       team: 'Parabol',
//       type: 'task'
//     },
//   ]
// };

const Matt = {
  avatar: avatarMatt,
  name: 'Matt Krick',
  present: true,
  outcomesX: [],
  outcomes: [
    {
      content: 'Me dashboard part 2 sprint merged',
      status: 'active',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Summary view implemented',
      status: 'stuck',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Task column empty states implemented with great skill',
      status: 'stuck',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Add beta signup link to readme',
      status: null,
      team: 'Parabol',
      type: 'action'
    },
    {
      content: 'User dashboard updates shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    },
    {
      content: 'Task column empty states shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    }
  ]
};

const Taya = {
  avatar: avatarTaya,
  name: 'Taya Mueller',
  present: false,
  outcomesX: [],
  outcomes: [
    {
      content: 'First consultant client signed',
      status: 'active',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Accelerator acceptance received',
      status: 'active',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Adjust copy for beta signup page',
      status: null,
      team: 'Parabol',
      type: 'action'
    }
  ]
};

const Terry = {
  avatar: avatarTerry,
  name: 'Terry Acker',
  present: true,
  outcomes: [],
  outcomesX: [
    {
      content: 'Summary email designed',
      status: 'done',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Summary email implemented',
      status: 'active',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Summary view designed',
      status: 'active',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Summary view implemented',
      status: 'stuck',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: `Task column empty states implemented with great skill
                and it is almost novel length but if it is longer than a
                tweet it will be trimmed and that is cool.`,
      status: 'stuck',
      team: 'Parabol',
      type: 'task'
    },
    {
      content: 'Summary updates shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    },
    {
      content: 'User dashboard updates shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    },
    {
      content: 'Task column empty states shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    }
  ]
};

const sampleTeamSummary = [];

sampleTeamSummary.push(Jordan, Marimar, Matt, Taya, Terry);

export default sampleTeamSummary;
