import {
  type InspirationDraftItem,
  isItemTextInAnswer,
  MIN_MATCHABLE_ITEM_TEXT_LENGTH,
  runInspirationInsert,
  trimTrailingEmptyParagraph
} from '../inspirationInsertPlan'

const draftItem = (id: string, promptId: string, text: string): InspirationDraftItem => ({
  id,
  promptId,
  blocks: [{type: 'paragraph', content: [{type: 'text', text}]}],
  text
})

const createDeps = () => ({
  insertAnswerBlocks: jest.fn<Promise<boolean>, [string, unknown[]]>(),
  sendEvent: jest.fn<void, [string, Record<string, unknown>]>(),
  onAdded: jest.fn<void, [string[]]>()
})

const run = (items: InspirationDraftItem[], deps: ReturnType<typeof createDeps>) =>
  runInspirationInsert({items, meetingId: 'meeting1', teamId: 'team1', ...deps})

describe('runInspirationInsert', () => {
  it('inserts every item and reports both analytics events', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks.mockResolvedValue(true)
    const items = [
      draftItem('i1', 'promptA', 'Shipped the migration'),
      draftItem('i2', 'promptA', 'Reviewed a PR'),
      draftItem('i3', 'promptB', 'Waiting on design')
    ]

    await run(items, deps)

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
  })

  it('skips a failed insert and only reports the ones that landed', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const items = [
      draftItem('j1', 'promptA', 'Shipped the migration'),
      draftItem('j2', 'promptA', 'Reviewed a PR')
    ]

    await run(items, deps)

    expect(deps.onAdded).toHaveBeenCalledWith(['j1'])
    expect(deps.sendEvent).toHaveBeenCalledWith('Inspiration Add Remaining', {
      count: 1,
      meetingId: 'meeting1',
      teamId: 'team1'
    })
  })

  it('does not report a single-item add as "remaining"', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks.mockResolvedValue(true)

    await run([draftItem('i1', 'promptA', 'Shipped the migration')], deps)

    expect(deps.onAdded).toHaveBeenCalledWith(['i1'])
    expect(deps.sendEvent).not.toHaveBeenCalledWith('Inspiration Add Remaining', expect.anything())
  })

  it('emits nothing when every insert fails', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks.mockResolvedValue(false)
    const items = [
      draftItem('k1', 'promptA', 'Shipped the migration'),
      draftItem('k2', 'promptA', 'Reviewed a PR')
    ]

    await run(items, deps)

    expect(deps.onAdded).not.toHaveBeenCalled()
    expect(deps.sendEvent).not.toHaveBeenCalled()
  })

  it('skips an item the reader emptied, with no insert or analytics for it', async () => {
    const deps = createDeps()
    deps.insertAnswerBlocks.mockResolvedValue(true)
    const items = [
      {...draftItem('i1', 'promptA', ''), blocks: [], text: ''},
      draftItem('i2', 'promptA', 'Shipped the migration')
    ]

    await run(items, deps)

    expect(deps.insertAnswerBlocks).toHaveBeenCalledTimes(1)
    expect(deps.insertAnswerBlocks).toHaveBeenCalledWith('promptA', items[1]!.blocks)
    expect(deps.onAdded).toHaveBeenCalledWith(['i2'])
  })

  it('emits nothing when every item is empty', async () => {
    const deps = createDeps()

    await run([{...draftItem('i1', 'promptA', ''), blocks: [], text: ''}], deps)

    expect(deps.insertAnswerBlocks).not.toHaveBeenCalled()
    expect(deps.sendEvent).not.toHaveBeenCalled()
    expect(deps.onAdded).not.toHaveBeenCalled()
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
