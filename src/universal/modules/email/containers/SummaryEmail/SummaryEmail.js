import React, {PropTypes} from 'react';
import Layout from '../../components/Layout/Layout';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Body from '../../components/Body/Body';
import UserOutcomes from '../../components/UserOutcomes/UserOutcomes';
import Footer from '../../components/Footer/Footer';
import theme from 'universal/styles/theme';

const sampleAvatar = '/static/images/avatars/jh-linkedin-avatar.jpg';

const Jordan = {
  avatar: sampleAvatar,
  name: 'Jordan Husney',
  outcomes: [
    {
      content: 'Summary email designed',
      status: 'done',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Summary email implemented',
      status: 'active',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Summary view designed',
      status: 'active',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Summary view implemented',
      status: 'stuck',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Project column empty states implemented with great skill',
      status: 'stuck',
      team: 'Parabol',
      type: 'project'
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
      content: 'Project column empty states shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    }
  ]
};

const Matt = {
  avatar: sampleAvatar,
  name: 'Matt Krick',
  outcomes: [
    {
      content: 'Me dashboard part 2 sprint merged',
      status: 'active',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Summary view implemented',
      status: 'stuck',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Project column empty states implemented with great skill',
      status: 'stuck',
      team: 'Parabol',
      type: 'project'
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
      content: 'Project column empty states shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    }
  ]
};

const Taya = {
  avatar: sampleAvatar,
  name: 'Taya Mueller',
  outcomes: [
    {
      content: 'First consultant client signed',
      status: 'active',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Accelerator acceptance received',
      status: 'active',
      team: 'Parabol',
      type: 'project'
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
  avatar: sampleAvatar,
  name: 'Terry Acker',
  outcomes: [
    {
      content: 'Summary email designed',
      status: 'done',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Summary email implemented',
      status: 'active',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Summary view designed',
      status: 'active',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Summary view implemented',
      status: 'stuck',
      team: 'Parabol',
      type: 'project'
    },
    {
      content: 'Project column empty states implemented with great skill',
      status: 'stuck',
      team: 'Parabol',
      type: 'project'
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
      content: 'Project column empty states shared',
      status: null,
      team: 'Parabol',
      type: 'action'
    }
  ]
};

const sampleTeamMembers = [];

const SummaryEmail = (props) => {
  const {teamMembers, teamName} = props;
  return (
    <Layout>

      <table width="100%">
        <tbody>
          <tr>
            <td
              align="center"
              style={{backgroundColor: theme.palette.warm}}
            >
              <EmptySpace height={16} />
            </td>
          </tr>
        </tbody>
      </table>

      <Body>
        <table>
          <tr>
            <td>
              <span>Summary email for {teamName}:</span>
              <EmptySpace height={24} />
            </td>
          </tr>
        </table>
        {teamMembers.map(member =>
          <UserOutcomes avatar={member.avatar} name={member.name} outcomes={member.outcomes} />
        )}
      </Body>
      <Footer color={theme.palette.dark} />
    </Layout>
  );
};

sampleTeamMembers.push(Jordan, Matt, Taya, Terry);

SummaryEmail.propTypes = {
  teamName: PropTypes.string,
  teamMembers: PropTypes.array,
};

SummaryEmail.defaultProps = {
  teamName: 'Parabol',
  teamMembers: sampleTeamMembers
};

export const summaryEmailText = (props) => `
Summary email text here for ${props.teamName}
`;

export default SummaryEmail;
