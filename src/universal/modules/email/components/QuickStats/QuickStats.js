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
    doneTaskCount,
    newTaskCount,
    teamMembers,
    teamMembersPresent
  } = props;

  const cellStyles = {
    padding: 0,
    textAlign: 'center',
    verticalAlign: 'top',
    width: '25%'
  };

  const typeStyles = {
    color: appTheme.palette.dark,
    fontFamily: ui.emailFontFamily
  };

  const statStyles = {
    backgroundColor: appTheme.palette.mid10l,
    padding: '8px 0 12px',
    textAlign: 'center'
  };

  const statValue = {
    ...typeStyles,
    fontSize: '36px'
  };

  const statLabel = {
    ...typeStyles,
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase'
  };

  const containerStyle = {
    margin: '0 auto',
    maxWidth: '440px',
    width: '100%'
  };

  return (
    <div style={containerStyle}>
      <table width="100%">
        <tbody>
          <tr>
            <td style={cellStyles}>
              <div style={{...statStyles, borderRadius: '4px 0 0 4px'}}>
                <div style={statValue}>{doneTaskCount}</div>
                <div style={statLabel}>{plural(doneTaskCount, 'Task')}{' Done'}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={statStyles}>
                <div style={statValue}>{agendaItems}</div>
                <div style={statLabel}>{plural(agendaItems, AGENDA_ITEM_LABEL)}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={statStyles}>
                <div style={statValue}>{newTaskCount}</div>
                <div style={statLabel}>{'New '}{plural(newTaskCount, 'Task')}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={{...statStyles, borderRadius: '0 4px 4px 0'}}>
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
  doneTaskCount: PropTypes.number,
  newTaskCount: PropTypes.number,
  teamMembers: PropTypes.number,
  teamMembersPresent: PropTypes.number
};

export default QuickStats;
