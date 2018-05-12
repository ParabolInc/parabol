import PropTypes from 'prop-types'
import React from 'react'
import EmptySpace from '../EmptySpace/EmptySpace'
import plural from 'universal/utils/plural'
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants'
import styles from './quickStatsStyles'

const {cellStyles, statStyles, statValue, statLabel, containerStyle} = styles

const QuickStats = (props) => {
  const {agendaItems, doneTaskCount, newTaskCount, teamMembers, teamMembersPresent} = props

  return (
    <div style={containerStyle}>
      <table width='100%'>
        <tbody>
          <tr>
            <td style={cellStyles}>
              <div style={{...statStyles, borderRadius: '4px 0 0 4px'}}>
                <div style={statValue}>{doneTaskCount}</div>
                <div style={statLabel}>
                  {plural(doneTaskCount, 'Task')}
                  {' Done'}
                </div>
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
                <div style={statLabel}>
                  {'New '}
                  {plural(newTaskCount, 'Task')}
                </div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={{...statStyles, borderRadius: '0 4px 4px 0'}}>
                <div style={statValue}>
                  {teamMembersPresent >= 10 ? (
                    <span>{teamMembersPresent}</span>
                  ) : (
                    <span>
                      {teamMembersPresent}/{teamMembers}
                    </span>
                  )}
                </div>
                <div style={statLabel}>{'Present'}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptySpace height={32} />
    </div>
  )
}

QuickStats.propTypes = {
  agendaItems: PropTypes.number,
  doneTaskCount: PropTypes.number,
  newTaskCount: PropTypes.number,
  teamMembers: PropTypes.number,
  teamMembersPresent: PropTypes.number
}

export default QuickStats
