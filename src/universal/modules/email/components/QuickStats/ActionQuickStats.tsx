import React from 'react'
import EmptySpace from '../EmptySpace/EmptySpace'
import plural from 'universal/utils/plural'
import styles from './quickStatsStyles'
import {AGENDA_ITEM_LABEL, AGENDA_ITEMS} from 'universal/utils/constants'

const {cellStyles, statStyles, statValue, statLabel, containerStyle} = styles

interface Props {
  meeting: {
    meetingMembers: {
      isCheckedIn?: boolean
      doneTasks: {
        id: string
      }[]
      tasks: {
        id: string
      }[]
    }[]
    phases: {
      phaseType: string
      stages: {
        isComplete: boolean
      }[]
    }[]
  }
}

const ActionQuickStats = (props: Props) => {
  const {meeting} = props
  const {meetingMembers, phases} = meeting
  const agendaItemPhase = phases.find((phase) => phase.phaseType === AGENDA_ITEMS)!
  const {stages} = agendaItemPhase
  const agendaItemsCompleted = stages.filter((stage) => stage.isComplete).length
  const newTaskCount = meetingMembers.reduce((sum, {tasks}) => sum + tasks.length, 0)
  const doneTaskCount = meetingMembers.reduce((sum, {doneTasks}) => sum + doneTasks.length, 0)
  const meetingMembersCount = meetingMembers.length
  const meetingMembersPresentCount = meetingMembers.filter((member) => member.isCheckedIn === true)
    .length
  return (
    <div style={containerStyle}>
      {/*
      // @ts-ignore*/}
      <table width='100%'>
        <tbody>
          <tr>
            <td style={cellStyles}>
              <div style={{...statStyles, borderRadius: '4px 0 0 4px'}}>
                <div style={statValue}>{doneTaskCount}</div>
                <div style={statLabel}>{`${plural(doneTaskCount, 'Task')} Done`}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={statStyles}>
                <div style={statValue}>{agendaItemsCompleted}</div>
                <div style={statLabel}>{plural(agendaItemsCompleted, AGENDA_ITEM_LABEL)}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={statStyles}>
                <div style={statValue}>{newTaskCount}</div>
                <div style={statLabel}>{plural(newTaskCount, 'New Task')}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={{...statStyles, borderRadius: '0 4px 4px 0'}}>
                <div style={statValue}>
                  {meetingMembersPresentCount >= 10 ? (
                    <span>{meetingMembersPresentCount}</span>
                  ) : (
                    <span>
                      {meetingMembersPresentCount}/{meetingMembersCount}
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

export default ActionQuickStats
