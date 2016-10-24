import React, {PropTypes} from 'react';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import OutcomesTable from '../../components/OutcomesTable/OutcomesTable';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const UserOutcomes = (props) => {
  const {avatar, name, outcomes, present} = props;
  const cardsCell = {
    padding: '8px',
    textAlign: 'center'
  };

  const textCenter = {
    fontFamily: ui.emailFontFamily,
    textAlign: 'center'
  };

  const avatarStyles = {
    borderRadius: '100%'
  };

  const labelStyle = {
    display: 'inline-block',
    fontFamily: ui.emailFontFamily,
    fontSize: '14px',
    fontWeight: 700,
    verticalAlign: 'middle'
  };

  const topBorderStyle = {
    ...textCenter,
    borderTop: `1px solid ${ui.cardBorderColor}`
  };

  const nameStyle = {
    color: appTheme.palette.dark,
    display: 'block',
    fontSize: '20px',
    padding: '4px 0'
  };

  const userStats = {
    ...textCenter,
    padding: '0 0 8px'
  };

  const presentLabelStyles = {
    color: present ? appTheme.palette.cool : appTheme.palette.cool10g,
    fontFamily: ui.emailFontFamily,
    fontSize: '14px',
    fontStyle: 'italic',
    fontWeight: 700,
    padding: '0 0 8px'
  };

  const centerStyle = {
    textAlign: 'center'
  };

  const presentLabel = present ? 'Present' : 'Absent';

  const totalActions = [];
  const totalProjects = [];

  outcomes.map(outcome => {
    if (outcome.type === 'action') {
      totalActions.push(outcome);
    } else {
      totalProjects.push(outcome);
    }
    return 'hola';
  });

  return (
    <table style={centerStyle} width="100%">
      <tbody>
        <tr>
          <td style={topBorderStyle}>
            <EmptySpace height={24} />
            <img height="80" src={avatar} style={avatarStyles} width="80" />
            <div style={nameStyle}>{name}</div>
            <div style={presentLabelStyles}>{presentLabel}</div>
          </td>
        </tr>
        {outcomes.length &&
          <tr>
            <td style={userStats}>
              {/* For some reason HTML prints 0 unless using length > 0 */}
              {totalProjects.length > 0 &&
                <span style={labelStyle}>
                {totalProjects.length} New Project{totalProjects.length > 1 && 's'}
                </span>
              }
              {totalProjects.length > 0 && totalActions.length > 0 &&
                <span style={{...labelStyle, padding: '0 8px'}}>{'•'}</span>
              }
              {totalActions.length > 0 &&
                <span style={labelStyle}>
                  {totalActions.length} New Action{totalActions.length > 1 && 's'}
                </span>
              }
            </td>
          </tr>
        }
        <tr>
          <td style={cardsCell}>
            <OutcomesTable outcomes={outcomes} />
            <EmptySpace height={24} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

UserOutcomes.propTypes = {
  avatar: PropTypes.string,
  name: PropTypes.string,
  outcomes: PropTypes.array,
  present: PropTypes.bool
};

export default UserOutcomes;
