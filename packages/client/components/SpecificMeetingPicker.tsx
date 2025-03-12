import * as ScrollArea from '@radix-ui/react-scroll-area'
import type {NodeViewProps} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useEffect} from 'react'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {SpecificMeetingPickerQuery} from '../__generated__/SpecificMeetingPickerQuery.graphql'
import type {InsightsBlockAttrs} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {Checkbox} from '../ui/Checkbox/Checkbox'
import {MeetingTypeToReadable} from './MeetingTypePickerCombobox'

const query = graphql`
  query SpecificMeetingPickerQuery(
    $after: DateTime!
    $first: Int!
    $before: DateTime!
    $meetingTypes: [MeetingTypeEnum!]!
    $teamIds: [ID!]!
  ) {
    viewer {
      meetings(
        after: $after
        before: $before
        first: $first
        meetingTypes: $meetingTypes
        teamIds: $teamIds
      ) {
        edges {
          node {
            id
            name
            createdAt
            meetingType
            team {
              name
            }
          }
        }
      }
    }
  }
`
interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
  queryRef: PreloadedQuery<SpecificMeetingPickerQuery>
}

export const SpecificMeetingPicker = (props: Props) => {
  const {updateAttributes, attrs, queryRef} = props
  const {meetingIds, after, before} = attrs
  const data = usePreloadedQuery<SpecificMeetingPickerQuery>(query, queryRef)
  const {viewer} = data
  const {meetings} = viewer
  const {edges} = meetings
  const includeYear = new Date(after).getFullYear() !== new Date(before).getFullYear()
  const formatter = includeYear ? 'MMM D, YYYY' : 'MMM D'

  const rows = edges.map((edge) => {
    const {node} = edge
    const {id, createdAt, meetingType, name, team} = node
    const {name: teamName} = team
    return {
      id,
      date: dayjs(createdAt).format(formatter),
      meetingType: MeetingTypeToReadable[meetingType],
      name,
      teamName,
      checked: meetingIds.includes(id)
    }
  })
  const allColumns = ['Name', 'Date', 'Team', 'Type']
  const ignoredTeamColumn = attrs.teamIds.length === 1 ? ['Team'] : []
  const ignoredTypeColumn = attrs.meetingTypes.length === 1 ? ['Type'] : []
  const ignoredColumns = ignoredTeamColumn.concat(ignoredTypeColumn)
  const columns = allColumns.filter((column) => !ignoredColumns.includes(column))
  const allChecked = meetingIds.length === edges.length
  useEffect(() => {
    if (meetingIds.length === 0) {
      // if no meetings are selected, when the list changes, select them all
      updateAttributes({meetingIds: edges.map(({node}) => node.id)})
    }
  }, [edges])
  return (
    <ScrollArea.Root className='flex max-h-52 overflow-hidden'>
      <ScrollArea.Scrollbar
        orientation='vertical'
        className='z-20 flex h-full w-2.5 touch-none border-l border-l-transparent p-[1px] transition-colors select-none'
      >
        <ScrollArea.Thumb className={`relative flex-1 rounded-full bg-slate-600`} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Viewport className='w-full'>
        <table className='size-full w-full border-collapse'>
          <thead className='sticky top-0 z-10 bg-slate-200'>
            <tr className='border-b-[1px] border-slate-400'>
              <th className='w-5 border-b-[1px] border-b-transparent pt-1 pr-1'>
                <Checkbox
                  onClick={() => {
                    const nextMeetingIds = allChecked ? [] : edges.map(({node}) => node.id)
                    updateAttributes({meetingIds: nextMeetingIds})
                  }}
                  checked={allChecked ? true : meetingIds.length === 0 ? false : 'indeterminate'}
                />
              </th>
              {columns.map((column) => {
                return (
                  <th
                    key={column}
                    className={
                      'border-slate-400 p-2 text-left font-bold not-last-of-type:border-r-[1px]'
                    }
                  >
                    {column}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const {checked, date, id, meetingType, name, teamName} = row
              return (
                <tr
                  key={id}
                  className='cursor-pointer border-slate-400 not-last-of-type:border-b-[1px]'
                  onClick={() => {
                    const nextMeetingIds = checked
                      ? meetingIds.filter((id) => id !== row.id)
                      : [...meetingIds, id]
                    updateAttributes({meetingIds: nextMeetingIds})
                  }}
                >
                  <td className='w-5 border-b-[1px] border-b-transparent pt-1'>
                    <Checkbox checked={checked} />
                  </td>
                  <td className='border-r-[1px] border-slate-400 p-2'>{name}</td>
                  <td className='border-r-[1px] border-slate-400 p-2 last-of-type:border-r-0'>
                    {date}
                  </td>
                  {columns.includes('Team') && (
                    <td className='border-r-[1px] border-slate-400 p-2 last-of-type:border-r-0'>
                      {teamName}
                    </td>
                  )}
                  {columns.includes('Type') && (
                    <td className='border-r-[1px] border-slate-400 p-2 last-of-type:border-r-0'>
                      {meetingType}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  )
}
