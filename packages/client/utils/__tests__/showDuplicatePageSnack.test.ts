import type Atmosphere from '../../Atmosphere'
import {showDuplicatePageSnack} from '../showDuplicatePageSnack'

type Emitted = [event: string, payload: unknown]

const setup = () => {
  const emitted: Emitted[] = []
  const atmosphere = {
    eventEmitter: {emit: (event: string, payload: unknown) => emitted.push([event, payload])}
  } as unknown as Atmosphere
  const added = () =>
    emitted
      .filter(([event]) => event === 'addSnackbar')
      .map(
        ([, payload]) =>
          payload as {
            key: string
            message: string
            autoDismiss: number
            action?: {label: string; callback: () => void}
          }
      )
  const removedKeys = () =>
    emitted
      .filter(([event]) => event === 'removeSnackbar')
      .flatMap(([, predicate]) =>
        ['duplicatePage', 'other'].filter((key) =>
          (predicate as (snack: {key: string}) => boolean)({key})
        )
      )
  return {atmosphere, added, removedKeys}
}

const page = {id: 'page:12', title: 'Plan B'}

test('start shows the working message', () => {
  const {atmosphere, added} = setup()
  showDuplicatePageSnack(atmosphere, {phase: 'start', title: 'Plan'})
  expect(added()).toEqual([{key: 'duplicatePage', message: 'Duplicating "Plan"…', autoDismiss: 0}])
})

test('copy to shows where it went with Open page', () => {
  const {atmosphere, added, removedKeys} = setup()
  const navigate = jest.fn()
  showDuplicatePageSnack(atmosphere, {
    phase: 'done',
    title: 'Plan',
    target: {kind: 'copyTo', title: 'Q3'},
    page,
    navigate
  })
  expect(removedKeys()).toEqual(['duplicatePage'])
  const [snack] = added()
  expect(snack!.message).toBe('Copied to "Q3"')
  expect(snack!.action!.label).toBe('Open page')
  snack!.action!.callback()
  expect(navigate).toHaveBeenCalledWith('/pages/plan-b-12')
})

test('private fallback names Private pages', () => {
  const {atmosphere, added} = setup()
  showDuplicatePageSnack(atmosphere, {
    phase: 'done',
    title: 'Plan',
    target: {kind: 'private'},
    page,
    navigate: jest.fn()
  })
  expect(added()[0]!.message).toBe('Copied "Plan" to your Private pages')
})

test('next to the original only clears the working snack', () => {
  const {atmosphere, added, removedKeys} = setup()
  showDuplicatePageSnack(atmosphere, {
    phase: 'done',
    title: 'Plan',
    target: {kind: 'nextTo'},
    page,
    navigate: jest.fn()
  })
  expect(added()).toHaveLength(0)
  expect(removedKeys()).toEqual(['duplicatePage'])
})

test('failed only clears the working snack', () => {
  const {atmosphere, added, removedKeys} = setup()
  showDuplicatePageSnack(atmosphere, {phase: 'failed'})
  expect(added()).toHaveLength(0)
  expect(removedKeys()).toEqual(['duplicatePage'])
})
