import {layoutReportFlow} from '../reportFlowLayout'
import type {ReportResultRow} from '../reportRows'

const row = (meetingType: string, status: string, count: number): ReportResultRow => ({
  keys: [
    {value: meetingType, label: meetingType, isPartial: false},
    {value: status, label: status, isPartial: false}
  ],
  values: [count],
  previousValues: null
})

const rows = [
  row('retrospective', 'done', 11),
  row('retrospective', 'active', 38),
  row('retrospective', 'stuck', 7),
  row('teamPrompt', 'done', 0),
  row('teamPrompt', 'active', 0),
  row('teamPrompt', 'stuck', 0)
]

test('every stage adds up to the same total, and a value with nothing gets no band', () => {
  const {stages, links, grandTotal} = layoutReportFlow(2, rows)
  expect(grandTotal).toBe(56)
  const [meetingTypes, statuses] = stages
  expect(meetingTypes!.map(({key, total}) => `${key.value} ${total}`)).toEqual([
    'retrospective 56',
    'teamPrompt 0'
  ])
  expect(statuses!.reduce((sum, {total}) => sum + total, 0)).toBe(56)
  expect(links.map(({target, amount}) => `${target.key.value} ${amount}`)).toEqual([
    'done 11',
    'active 38',
    'stuck 7'
  ])
})

test('a node’s bands stack inside it, top to bottom', () => {
  const {stages, links} = layoutReportFlow(2, rows)
  const retro = stages[0]![0]!
  expect(links[0]!.sourceY).toBe(retro.y)
  const last = links.at(-1)!
  expect(last.sourceY + last.thickness).toBeCloseTo(retro.y + retro.height)
})
