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

  const iconStyle = {
    display: 'inline-block',
    height: '14px',
    marginRight: '8px',
    verticalAlign: 'middle',
    width: '13px'
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

  // const getNewOutcomeTypeCount = (arr, string) => {
  //   return arr.reduce((p, c) => {
  //     if (c.type === string) {
  //       p++;
  //     }
  //     return p;
  //   }, 0);
  // };

  return (
    <table align="center" width="100%">
      <tbody>
        <tr>
          <td style={topBorderStyle}>
            <EmptySpace height={24} />
            <img src={avatar} height="64" width="64" />
            <span style={nameStyle}>{name}</span>
          </td>
        </tr>
        <tr>
          <td style={userStats}>
            <img src="/static/images/email/email-icon-project@3x.png" style={iconStyle} />
            <span style={{...labelStyle, marginRight: '20px'}}>
              {reduceForKeyValCount(outcomes, 'type', 'project')} New Projects
            </span>
            <img src="/static/images/email/email-icon-action@3x.png" style={iconStyle} />
            <span style={labelStyle}>
              {reduceForKeyValCount(outcomes, 'type', 'action')} New Actions
            </span>
          </td>
        </tr>
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
  outcomes: PropTypes.array
};

export default UserOutcomes;
