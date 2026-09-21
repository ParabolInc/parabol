import {
  clearDraftAnswers,
  clearStageDrafts,
  draftAnswerKey,
  readDraftAnswer,
  writeDraftAnswer
} from '../teamPromptDraftStorage'

const store = new Map<string, string>()

const localStorageStub = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  key: (index: number) => [...store.keys()][index] ?? null,
  get length() {
    return store.size
  }
}

const throwingLocalStorage = {
  getItem: () => {
    throw new Error('denied')
  },
  setItem: () => {
    throw new Error('denied')
  },
  removeItem: () => {
    throw new Error('denied')
  },
  key: () => {
    throw new Error('denied')
  },
  get length(): number {
    throw new Error('denied')
  }
}

const setLocalStorage = (localStorage: unknown) => {
  Object.defineProperty(globalThis, 'window', {value: {localStorage}, writable: true})
}

const doc = {type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text: 'hi'}]}]}

describe('draft answer storage', () => {
  beforeEach(() => {
    store.clear()
    setLocalStorage(localStorageStub)
  })

  it('writes and reads a draft per stage and prompt', () => {
    writeDraftAnswer('stage1', 'prompt1', doc)
    expect(store.get(draftAnswerKey('stage1', 'prompt1'))).toBe(JSON.stringify(doc))
    expect(readDraftAnswer('stage1', 'prompt1')).toEqual(doc)
    expect(readDraftAnswer('stage1', 'prompt2')).toBeNull()
    expect(readDraftAnswer('stage2', 'prompt1')).toBeNull()
  })

  it('returns null for unparseable content', () => {
    store.set(draftAnswerKey('stage1', 'prompt1'), 'not json')
    expect(readDraftAnswer('stage1', 'prompt1')).toBeNull()
  })

  it('clears only the named prompts', () => {
    writeDraftAnswer('stage1', 'prompt1', doc)
    writeDraftAnswer('stage1', 'prompt2', doc)
    clearDraftAnswers('stage1', ['prompt1'])
    expect(readDraftAnswer('stage1', 'prompt1')).toBeNull()
    expect(readDraftAnswer('stage1', 'prompt2')).toEqual(doc)
  })

  it('clears every draft for one stage only', () => {
    writeDraftAnswer('stage1', 'prompt1', doc)
    writeDraftAnswer('stage1', 'prompt2', doc)
    writeDraftAnswer('stage2', 'prompt1', doc)
    store.set('unrelated', 'keep me')
    clearStageDrafts('stage1')
    expect(readDraftAnswer('stage1', 'prompt1')).toBeNull()
    expect(readDraftAnswer('stage1', 'prompt2')).toBeNull()
    expect(readDraftAnswer('stage2', 'prompt1')).toEqual(doc)
    expect(store.get('unrelated')).toBe('keep me')
  })

  it('tolerates a localStorage that throws', () => {
    setLocalStorage(throwingLocalStorage)
    expect(() => writeDraftAnswer('stage1', 'prompt1', doc)).not.toThrow()
    expect(readDraftAnswer('stage1', 'prompt1')).toBeNull()
    expect(() => clearDraftAnswers('stage1', ['prompt1'])).not.toThrow()
    expect(() => clearStageDrafts('stage1')).not.toThrow()
  })
})
