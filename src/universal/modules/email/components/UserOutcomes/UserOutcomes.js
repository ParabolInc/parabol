import React, {PropTypes} from 'react';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import OutcomesTable from '../../components/OutcomesTable/OutcomesTable';
import ui from 'universal/styles/ui';
import reduceForKeyValCount from 'universal/utils/reduceForKeyValCount';

const UserOutcomes = (props) => {
  const {avatar, name, outcomes} = props;
  const cardsCell = {
    padding: '8px'
  };

  const textCenter = {
    textAlign: 'center'
  };

  const avatarStyles = {
    borderRadius: '100%'
  };

  const labelStyle = {
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 700,
    verticalAlign: 'middle'
  };

  const topBorderStyle = {
    ...textCenter,
    borderTop: `1px solid ${ui.cardBorderColor}`
  };

  const nameStyle = {
    display: 'block',
    fontSize: '20px',
    padding: '4px 0 8px'
  };

  const userStats = {
    ...textCenter,
    padding: '0 0 8px'
  };

  const emptyOutcomesMessage = {
    ...textCenter,
    backgroundColor: '#ffffff',
    border: `1px solid ${ui.cardBorderColor}`,
    borderRadius: '4px',
    fontSize: '16px',
    fontStyle: 'italic',
    padding: '16px'
  };

  return (
    <table align="center" width="100%">
      <tbody>
        <tr>
          <td style={topBorderStyle}>
            <EmptySpace height={24} />
            <img height="80" src={avatar} style={avatarStyles} width="80" />
            <span style={nameStyle}>{name}</span>
          </td>
        </tr>
        {outcomes.length &&
          <tr>
            <td style={userStats}>
              <span style={labelStyle}>
                {reduceForKeyValCount(outcomes, 'type', 'project')} New Projects
              </span>
              <span style={{...labelStyle, padding: '0 8px'}}>{'•'}</span>
              <span style={labelStyle}>
                {reduceForKeyValCount(outcomes, 'type', 'action')} New Actions
              </span>
            </td>
          </tr>
        }
        <tr>
          <td style={cardsCell}>
            {outcomes.length ?
              <OutcomesTable outcomes={outcomes} /> :
              <div style={{padding: '0 8px'}}>
                <div style={emptyOutcomesMessage}>
                  {'No new Projects or Actions this week…'}
                </div>
              </div>
            }
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
  outcomes: PropTypes.array
};

export default UserOutcomes;
