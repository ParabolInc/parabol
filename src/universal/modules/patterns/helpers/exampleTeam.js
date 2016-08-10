import Jordan from 'universal/styles/theme/images/avatars/jordan-husney-avatar.jpg';
import Matt from 'universal/styles/theme/images/avatars/matt-krick-bw.png';
import Marimar from 'universal/styles/theme/images/avatars/miramar-suarez-penalva.jpg';
import Taya from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import Terry from 'universal/styles/theme/images/avatars/terry-acker-avatar.jpg';

const exampleTeam = {
  teamId: 'exampleTeam',
  teamName: 'Play',
  timerValue: '30:00',
  teamMembers: [
    {
      isCheckedIn: true,
      isConnected: true,
      hasBadge: true,
      preferredName: 'Jordan',
      picture: Jordan,
      size: 'small'
    },
    {
      isCheckedIn: true,
      isConnected: true,
      hasBadge: true,
      preferredName: 'Matt',
      picture: Matt,
      size: 'small'
    },
    {
      isCheckedIn: true,
      isConnected: false,
      hasBadge: true,
      preferredName: 'Marimar',
      picture: Marimar,
      size: 'small'
    },
    {
      isCheckedIn: true,
      isConnected: false,
      hasBadge: true,
      preferredName: 'Taya',
      picture: Taya,
      size: 'small'
    },
    {
      isCheckedIn: false,
      isConnected: false,
      hasBadge: true,
      preferredName: 'Terry',
      picture: Terry,
      size: 'small'
    }
  ]
};

export default exampleTeam;
