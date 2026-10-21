import buildReportAskPrompt from '../buildReportAskPrompt'
import {REPORT_ANSWER_JSON_SCHEMA} from '../reportAnswerJsonSchema'
import requestReportSpec, {type ReportAskMessage} from '../requestReportSpec'

const retroTasks = {
  measures: ['NEW_TASKS'],
  breakdown: [{dimension: 'TEAM'}, {dimension: 'DONE_OR_OPEN'}],
  filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
  where: [],
  period: {preset: 'PAGE', startDate: null, endDate: null},
  compareTo: null,
  showAs: 'BARS',
  sort: null,
  limit: null
}

const answer = (fields: Record<string, unknown>) =>
  JSON.stringify({
    canAnswer: true,
    reason: null,
    title: 'Retro tasks by team',
    spec: retroTasks,
    ...fields
  })

// a stand-in for the model that answers in turn and keeps what it was sent
const fakeModel = (contents: string[]) => {
  const calls: ReportAskMessage[][] = []
  const complete = async (messages: ReportAskMessage[]) => {
    calls.push([...messages])
    return {content: contents[calls.length - 1] ?? null, tokenCost: 100}
  }
  return {complete, calls}
}

const ask = (complete: ReturnType<typeof fakeModel>['complete']) =>
  requestReportSpec({
    question: 'Are tasks from retros getting done?',
    teams: [{id: 'team1', name: 'Core Infra'}],
    today: '2026-10-21',
    timeZone: 'America/Los_Angeles',
    complete
  })

test('a spec that follows the rules becomes the report', async () => {
  const model = fakeModel([answer({})])
  const result = await ask(model.complete)
  expect(result).toMatchObject({
    spec: {measures: ['NEW_TASKS'], showAs: 'BARS'},
    title: 'Retro tasks by team',
    tokenCost: 100
  })
  expect(model.calls).toHaveLength(1)
})

test('a spec that breaks a rule goes back once with the rule it broke', async () => {
  const model = fakeModel([answer({spec: {...retroTasks, showAs: 'NUMBER'}}), answer({})])
  const result = await ask(model.complete)
  expect(result.spec).not.toBeNull()
  expect(result.tokenCost).toBe(200)
  const retry = model.calls[1]!.at(-1)!
  expect(retry).toMatchObject({
    role: 'user',
    content: expect.stringContaining('NUMBER takes 0 breakdowns')
  })
})

test('a spec that breaks the rules twice is not a report', async () => {
  const broken = answer({spec: {...retroTasks, measures: ['LAST_MEETING']}})
  const result = await ask(fakeModel([broken, broken]).complete)
  expect(result).toMatchObject({
    spec: null,
    reason: expect.stringContaining('couldn’t make a report')
  })
})

test('an answer that is not JSON gets one more try', async () => {
  const result = await ask(fakeModel(['not json', answer({})]).complete)
  expect(result.spec).not.toBeNull()
})

test('a question Parabol has no data for says what is missing', async () => {
  const model = fakeModel([
    JSON.stringify({
      canAnswer: false,
      reason: 'Parabol doesn’t track story points.',
      title: null,
      spec: null
    })
  ])
  const result = await ask(model.complete)
  expect(result).toEqual({
    spec: null,
    reason: 'Parabol doesn’t track story points.',
    aiSpec: null,
    tokenCost: 100
  })
})

test('the prompt names every measure, the teams and today', () => {
  const prompt = buildReportAskPrompt({
    teams: [{id: 'team1', name: 'Core Infra'}],
    today: '2026-10-21',
    timeZone: 'America/Los_Angeles'
  })
  expect(prompt).toContain('Today is 2026-10-21 in America/Los_Angeles')
  expect(prompt).toContain('- team1: Core Infra')
  expect(prompt).toContain('- TASKS_PUSHED (Tasks pushed to integrations)')
  expect(prompt).toContain('retrospective (Retrospective)')
})

test('the answer schema is strict all the way down', () => {
  const objects: Record<string, unknown>[] = []
  const visit = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(visit)
    if (typeof node !== 'object' || node === null) return
    const record = node as Record<string, unknown>
    if (record.type === 'object') objects.push(record)
    Object.values(record).forEach(visit)
  }
  visit(REPORT_ANSWER_JSON_SCHEMA)
  expect(objects.length).toBeGreaterThan(5)
  for (const object of objects) {
    expect(object.additionalProperties).toBe(false)
    expect(object.required).toEqual(Object.keys(object.properties as object))
  }
})
