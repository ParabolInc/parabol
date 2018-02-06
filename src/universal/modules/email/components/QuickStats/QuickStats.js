import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import EmptySpace from '../EmptySpace/EmptySpace';
import plural from 'universal/utils/plural';
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants';

const QuickStats = (props) => {
  const {
    agendaItems,
    newTasks,
    teamMembers,
    teamMembersPresent
  } = props;

  const cellStyles = {
    padding: '0 8px',
    textAlign: 'center',
    verticalAlign: 'top',
    width: '25%'
  };

  const typeStyles = {
    color: appTheme.palette.dark,
    fontFamily: ui.emailFontFamily
  };

  const headingStyles = {
    ...typeStyles,
    fontSize: '20px',
    fontWeight: 700,
    padding: '0 0 16px',
    textAlign: 'center',
    textTransform: 'uppercase'
  };

  const statStyles = {
    backgroundColor: '#ffffff',
    border: `1px solid ${ui.cardBorderColor}`,
    borderRadius: '4px',
    padding: '8px 0 12px',
    textAlign: 'center'
  };

  const statValue = {
    ...typeStyles,
    fontSize: '48px'
  };

  const statLabel = {
    ...typeStyles,
    fontSize: '14px',
    fontWeight: 700
  };

  return (
    <div>
      <div style={headingStyles}>
        Quick Stats
      </div>
      <table width="100%">
        <tbody>
          <tr>
            <td style={cellStyles}>
              <div style={statStyles}>
                <div style={statValue}>{agendaItems}</div>
                <div style={statLabel}>{plural(agendaItems, AGENDA_ITEM_LABEL)}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={statStyles}>
                <div style={statValue}>{newTasks}</div>
                <div style={statLabel}>New {plural(newTasks, 'Task')}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={statStyles}>
                <div style={statValue}>
                  {teamMembersPresent >= 10 ?
                    <span>{teamMembersPresent}</span> :
                    <span>{teamMembersPresent}/{teamMembers}</span>
                  }
                </div>
                <div style={statLabel}>Present</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptySpace height={32} />
    </div>
  );
};

QuickStats.propTypes = {
  agendaItems: PropTypes.number,
  newTasks: PropTypes.number,
  teamMembers: PropTypes.number,
  teamMembersPresent: PropTypes.number
};

export default QuickStats;
