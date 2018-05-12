// @flow
import React from 'react'
import ui from 'universal/styles/ui'
import EmptySpace from '../EmptySpace/EmptySpace'
import MeetingMemberNoTasksRow from 'universal/modules/email/components/SummaryEmail/MeetingMemberNoTasksRow'
import type {MeetingTypeEnum} from 'universal/types/schema.flow'
import {RETROSPECTIVE} from 'universal/utils/constants'

const cardsCell = {
  padding: '8px'
}

const textCenter = {
  fontFamily: ui.emailFontFamily,
  textAlign: 'center'
}

const topBorderStyle = {
  ...textCenter,
  borderTop: `${ui.emailRuleHeight} solid ${ui.emailRuleColor}`
}

const emptyOutcomesMessage = {
  ...textCenter,
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  fontFamily: ui.emailFontFamily,
  fontSize: '18px',
  fontWeight: 600
}

const getMemberRows = (arr) => {
  const rows = []
  const length = arr.length
  // Never 1 person on a row alone, make rows of 3 or 4
  // Never 2 people after a row of 4, make rows of 3
  const modulo = length % 4
  let rowLength = 4
  if (modulo === 1 || modulo === 2) {
    rowLength = 3
  }
  for (let i = 0; i < length; i += rowLength) {
    const subArr = arr.slice(i, i + rowLength)
    rows.push(subArr)
  }
  return rows
}

type MeetingMember = {
  id: string,
  isCheckedIn: ?boolean,
  user: {
    picture: string,
    preferredName: string
  }
}

type Props = {
  members: Array<MeetingMember>,
  meetingType: MeetingTypeEnum
}

const getHeaderText = (meetingType) => {
  switch (meetingType) {
    case RETROSPECTIVE:
      return 'No New Tasks…'
    default:
      return 'No Done or New Tasks…'
  }
}

const MeetingMemberNoTasks = (props: Props) => {
  const {meetingType, members} = props
  if (members.length === 0) return null
  const memberRows = getMemberRows(members)
  /* eslint-disable react/no-array-index-key */
  return (
    <table align='center' style={ui.emailTableBase} width='100%'>
      <tbody>
        <tr>
          <td style={topBorderStyle}>
            <EmptySpace height={24} />
          </td>
        </tr>
        <tr>
          <td style={cardsCell}>
            <div style={{padding: '0 8px'}}>
              <div style={emptyOutcomesMessage}>{getHeaderText(meetingType)}</div>
            </div>
            <EmptySpace height={24} />
          </td>
        </tr>
        <tr>
          <td align='center'>
            <table align='center' style={ui.emailTableBase}>
              <tbody>
                {memberRows.map((row, idx) => (
                  <tr key={`memberCell${idx}`}>
                    <MeetingMemberNoTasksRow members={row} />
                  </tr>
                ))}
              </tbody>
            </table>
            <EmptySpace height={24} />
          </td>
        </tr>
      </tbody>
    </table>
  )
  /* eslint-enable */
}

export default MeetingMemberNoTasks
