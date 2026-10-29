import {parseReportSpec} from '../parseReportSpec'
import {POPULAR_REPORT_QUESTIONS} from '../popularReportQuestions'

test('every popular question has a spec Parabol can run', () => {
  const unparsable = POPULAR_REPORT_QUESTIONS.filter(({spec}) => !parseReportSpec(spec).spec)
  expect(unparsable.map(({key}) => key)).toEqual([])
})

test('every popular question has a key of its own', () => {
  const keys = POPULAR_REPORT_QUESTIONS.map(({key}) => key)
  expect(new Set(keys).size).toBe(keys.length)
})
