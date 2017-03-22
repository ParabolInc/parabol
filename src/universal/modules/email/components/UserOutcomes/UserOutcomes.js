import React, {PropTypes} from 'react';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import OutcomesTable from '../../components/OutcomesTable/OutcomesTable';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import plural from 'universal/utils/plural';

const UserOutcomes = (props) => {
  const {member} = props;
  const {actions, projects, picture, preferredName, present} = member;
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

  const presentLabel = present ? 'Present' : 'Absent';

  return (
    <table align="center" width="100%">
      <tbody>
        <tr>
          <td style={topBorderStyle}>
            <EmptySpace height={24} />
            <img height="80" src={picture} style={avatarStyles} width="80" />
            <div style={nameStyle}>{preferredName}</div>
            <div style={presentLabelStyles}>{presentLabel}</div>
          </td>
        </tr>
        <tr>
          <td style={userStats}>
            {/* For some reason HTML prints 0 unless using length > 0 */}
            {projects.length > 0 &&
              <span style={labelStyle}>
                {`${projects.length} New ${plural(projects.length, 'Project')}`}
              </span>
            }
            {projects.length > 0 && actions.length > 0 &&
              <span style={{...labelStyle, padding: '0 8px'}}>{'•'}</span>
            }
            {actions.length > 0 &&
              <span style={labelStyle}>
                {`${actions.length} New ${plural(actions.length, 'Action')}`}
              </span>
            }
          </td>
        </tr>
        <tr>
          <td align="center" style={cardsCell}>
            <OutcomesTable outcomes={projects.concat(actions)} />
            <EmptySpace height={24} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

UserOutcomes.propTypes = {
  member: PropTypes.object.isRequired
};

export default UserOutcomes;
