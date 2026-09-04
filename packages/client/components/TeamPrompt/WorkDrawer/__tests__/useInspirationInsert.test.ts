import type {Snack} from '../../../Snackbar'
import type {InsertHandle} from '../../structured/TeamPromptComposerApiContext'
import {
  buildAddedToastMessage,
  type InspirationDraftItem,
  isItemTextInAnswer,
  MIN_MATCHABLE_ITEM_TEXT_LENGTH,
  runInspirationInsert,
  trimTrailingEmptyParagraph
} from '../inspirationInsertPlan'
import type {WorkDrawerPrompt} from '../WorkDrawerConsumeContext'

const PROMPT_A: WorkDrawerPrompt = {id: 'promptA', question: 'What did you do?', groupColor: 'sky'}
const PROMPT_B: WorkDrawerPrompt = {
  id: 'promptB',
  question: 'What is blocking you?',
  groupColor: 'rose'
}
const PROMPTS = [PROMPT_A, PROMPT_B]

const draftItem = (id: string, promptId: string, text: string): InspirationDraftItem => ({
  id,
  promptId,
  blocks: [{type: 'paragraph', content: [{type: 'text', text}]}],
  text
})

const createDeps = () => ({
  insertAnswerBlocks: jest.fn<Promise<InsertHandle | null>, [string, unknown[]]>(),
  undoInsert: jest.fn<boolean, [InsertHandle]>(),
  forgetInsert: jest.fn<void, [InsertHandle]>(),
  emitSnackbar: jest.fn<void, [Snack]>(),
  sendEvent: jest.fn<void, [string, Record<string, unknown>]>(),
  onAdded: jest.fn<void, [string[]]>(),
  onRemoved: jest.fn<void, [string[]]>()
})

describe('runInspirationInsert', () => {
  it('inserts every item, emits one grouped toast, and reports both analytics events', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks
      .mockResolvedValueOnce({id: 'promptA:1', promptId: 'promptA'})
      .mockResolvedValueOnce({id: 'promptA:2', promptId: 'promptA'})
      .mockResolvedValueOnce({id: 'promptB:1', promptId: 'promptB'})
    const items = [
      draftItem('i1', 'promptA', 'Shipped the migration'),
      draftItem('i2', 'promptA', 'Reviewed a PR'),
      draftItem('i3', 'promptB', 'Waiting on design')
    ]

    await runInspirationInsert({
      items,
      prompts: PROMPTS,
      meetingId: 'meeting1',
      teamId: 'team1',
      ...deps
    })

    expect(deps.insertAnswerBlocks).toHaveBeenCalledTimes(3)
    const itemAddedEvents = deps.sendEvent.mock.calls.filter(
      ([event]) => event === 'Inspiration Item Added'
    )
    expect(itemAddedEvents).toHaveLength(3)
    expect(deps.sendEvent).toHaveBeenCalledWith('Inspiration Add Remaining', {
      count: 3,
      meetingId: 'meeting1',
      teamId: 'team1'
    })
    expect(deps.onAdded).toHaveBeenCalledWith(['i1', 'i2', 'i3'])
    expect(deps.emitSnackbar).toHaveBeenCalledTimes(1)
    const snack = deps.emitSnackbar.mock.calls[0]![0]
    expect(snack.message).toBe('Added 3 answers')
    expect(snack.action?.label).toBe('Undo')
  })

  it('undoes every insert and clears the added items on Undo', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks
      .mockResolvedValueOnce({id: 'promptA:1', promptId: 'promptA'})
      .mockResolvedValueOnce({id: 'promptA:2', promptId: 'promptA'})
      .mockResolvedValueOnce({id: 'promptB:1', promptId: 'promptB'})
    deps.undoInsert.mockReturnValue(true)
    const items = [
      draftItem('i1', 'promptA', 'Shipped the migration'),
      draftItem('i2', 'promptA', 'Reviewed a PR'),
      draftItem('i3', 'promptB', 'Waiting on design')
    ]

    await runInspirationInsert({
      items,
      prompts: PROMPTS,
      meetingId: 'meeting1',
      teamId: 'team1',
      ...deps
    })
    const snack = deps.emitSnackbar.mock.calls[0]![0]
    snack.action?.callback()

    expect(deps.undoInsert).toHaveBeenCalledTimes(3)
    expect(deps.onRemoved).toHaveBeenCalledWith(['i1', 'i2', 'i3'])
    expect(isItemTextInAnswer('', items[0]!.text)).toBe(false)
  })

  it('keeps a still-streaming handle marked as added when its undo fails', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks
      .mockResolvedValueOnce({id: 'promptA:1', promptId: 'promptA'})
      .mockResolvedValueOnce({id: 'promptA:2', promptId: 'promptA'})
      .mockResolvedValueOnce({id: 'promptB:1', promptId: 'promptB'})
    deps.undoInsert.mockImplementation((handle) => handle.id !== 'promptA:2')
    const items = [
      draftItem('i1', 'promptA', 'Shipped the migration'),
      draftItem('i2', 'promptA', 'Reviewed a PR'),
      draftItem('i3', 'promptB', 'Waiting on design')
    ]

    await runInspirationInsert({
      items,
      prompts: PROMPTS,
      meetingId: 'meeting1',
      teamId: 'team1',
      ...deps
    })
    const snack = deps.emitSnackbar.mock.calls[0]![0]
    snack.action?.callback()

    expect(deps.undoInsert).toHaveBeenCalledTimes(3)
    expect(deps.onRemoved).toHaveBeenCalledWith(['i1', 'i3'])
    expect(deps.emitSnackbar).toHaveBeenCalledTimes(1)
  })

  it('stays silent when every undo fails, total or partial', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks.mockResolvedValueOnce({id: 'promptA:1', promptId: 'promptA'})
    deps.undoInsert.mockReturnValue(false)
    const items = [draftItem('i1', 'promptA', 'Shipped the migration')]

    await runInspirationInsert({
      items,
      prompts: PROMPTS,
      meetingId: 'meeting1',
      teamId: 'team1',
      ...deps
    })
    const snack = deps.emitSnackbar.mock.calls[0]![0]
    snack.action?.callback()

    expect(deps.onRemoved).not.toHaveBeenCalled()
    expect(deps.emitSnackbar).toHaveBeenCalledTimes(1)
  })

  it('forgets every insert when the toast is dismissed without Undo', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks
      .mockResolvedValueOnce({id: 'promptA:1', promptId: 'promptA'})
      .mockResolvedValueOnce({id: 'promptA:2', promptId: 'promptA'})
      .mockResolvedValueOnce({id: 'promptB:1', promptId: 'promptB'})
    const items = [
      draftItem('i1', 'promptA', 'Shipped the migration'),
      draftItem('i2', 'promptA', 'Reviewed a PR'),
      draftItem('i3', 'promptB', 'Waiting on design')
    ]

    await runInspirationInsert({
      items,
      prompts: PROMPTS,
      meetingId: 'meeting1',
      teamId: 'team1',
      ...deps
    })
    const snack = deps.emitSnackbar.mock.calls[0]![0]
    snack.onDismiss?.()

    expect(deps.forgetInsert).toHaveBeenCalledTimes(3)
    expect(deps.undoInsert).not.toHaveBeenCalled()
  })

  it('ignores Undo after a dismiss, and dismiss after an Undo', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks.mockResolvedValueOnce({id: 'promptA:1', promptId: 'promptA'})
    deps.undoInsert.mockReturnValue(true)
    const items = [draftItem('i1', 'promptA', 'Shipped the migration')]

    await runInspirationInsert({
      items,
      prompts: PROMPTS,
      meetingId: 'meeting1',
      teamId: 'team1',
      ...deps
    })
    const snack = deps.emitSnackbar.mock.calls[0]![0]
    snack.action?.callback()
    snack.onDismiss?.()

    expect(deps.undoInsert).toHaveBeenCalledTimes(1)
    expect(deps.forgetInsert).not.toHaveBeenCalled()
  })

  it('skips a failed insert: no toast entry for it and a shorter message', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks
      .mockResolvedValueOnce({id: 'promptA:1', promptId: 'promptA'})
      .mockResolvedValueOnce(null)
    const items = [
      draftItem('j1', 'promptA', 'Shipped the migration'),
      draftItem('j2', 'promptA', 'Reviewed a PR')
    ]

    await runInspirationInsert({
      items,
      prompts: PROMPTS,
      meetingId: 'meeting1',
      teamId: 'team1',
      ...deps
    })

    expect(deps.onAdded).toHaveBeenCalledWith(['j1'])
    expect(deps.sendEvent).toHaveBeenCalledWith('Inspiration Add Remaining', {
      count: 1,
      meetingId: 'meeting1',
      teamId: 'team1'
    })
    const snack = deps.emitSnackbar.mock.calls[0]![0]
    expect(snack.message).toBe(`Added to “${PROMPT_A.question}”`)
  })

  it('emits nothing when every insert fails', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
    const items = [
      draftItem('k1', 'promptA', 'Shipped the migration'),
      draftItem('k2', 'promptA', 'Reviewed a PR')
    ]

    await runInspirationInsert({
      items,
      prompts: PROMPTS,
      meetingId: 'meeting1',
      teamId: 'team1',
      ...deps
    })

    expect(deps.onAdded).not.toHaveBeenCalled()
    expect(deps.emitSnackbar).not.toHaveBeenCalled()
    expect(deps.sendEvent).not.toHaveBeenCalledWith('Inspiration Add Remaining', expect.anything())
  })
})

describe('buildAddedToastMessage', () => {
  it('returns null when nothing was inserted', () => {
    expect(buildAddedToastMessage(0, 'What did you do?')).toBeNull()
  })

  it('names the question for a single insert', () => {
    expect(buildAddedToastMessage(1, 'What did you do?')).toBe('Added to “What did you do?”')
  })

  it('counts several inserts instead of naming each question', () => {
    expect(buildAddedToastMessage(3, 'What did you do?')).toBe('Added 3 answers')
  })
})

describe('isItemTextInAnswer', () => {
  it('matches when the answer contains the item text', () => {
    expect(isItemTextInAnswer('Shipped the migration today', 'Shipped the migration')).toBe(true)
  })

  it('normalizes whitespace on both sides before matching', () => {
    expect(isItemTextInAnswer('Shipped   the\nmigration today', 'Shipped the migration')).toBe(true)
  })

  it('is false when the text was removed', () => {
    expect(isItemTextInAnswer('Reviewed a PR', 'Shipped the migration')).toBe(false)
  })

  it('is false for empty item text', () => {
    expect(isItemTextInAnswer('Anything at all', '')).toBe(false)
  })

  it('is false when the normalized item text is below the minimum length', () => {
    const itemText = 'A'.repeat(MIN_MATCHABLE_ITEM_TEXT_LENGTH - 1)
    expect(isItemTextInAnswer(`prefix ${itemText} suffix`, itemText)).toBe(false)
  })

  it('matches once the normalized item text reaches the minimum length', () => {
    const itemText = 'A'.repeat(MIN_MATCHABLE_ITEM_TEXT_LENGTH)
    expect(isItemTextInAnswer(`prefix ${itemText} suffix`, itemText)).toBe(true)
  })
})

describe('trimTrailingEmptyParagraph', () => {
  const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
  const bulletList = {
    type: 'bulletList',
    content: [{type: 'listItem', content: [paragraph('alpha')]}]
  }

  it('drops the trailing node the card editor appends after a list', () => {
    expect(trimTrailingEmptyParagraph([bulletList, {type: 'paragraph'}])).toEqual([bulletList])
  })

  it('keeps a trailing paragraph that has content', () => {
    const blocks = [bulletList, paragraph('written by the reader')]
    expect(trimTrailingEmptyParagraph(blocks)).toEqual(blocks)
  })

  it('returns nothing for a document that is only an empty paragraph', () => {
    expect(trimTrailingEmptyParagraph([{type: 'paragraph'}])).toEqual([])
  })

  it('returns nothing for an empty block list', () => {
    expect(trimTrailingEmptyParagraph([])).toEqual([])
  })
})
