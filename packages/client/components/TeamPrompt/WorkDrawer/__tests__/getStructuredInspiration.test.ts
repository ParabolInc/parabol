import type {TeamPromptComposerApi} from '../../structured/TeamPromptComposerApiContext'
import getStructuredInspiration from '../getStructuredInspiration'
import type {WorkDrawerConsume, WorkDrawerPrompt} from '../WorkDrawerConsumeContext'

const composer: TeamPromptComposerApi = {
  insertAnswerBlocks: () => Promise.resolve(null),
  undoInsert: () => false,
  forgetInsert: () => {},
  getAnswerText: () => ''
}

const prompts: WorkDrawerPrompt[] = [
  {id: 'p1', question: 'What did you do?', groupColor: '#493272'}
]

const retro: WorkDrawerConsume = {
  mode: 'retro',
  getNextReflectionSortOrder: () => 0,
  getReflectPrompt: () => null,
  isReflectionAdded: () => false
}

describe('getStructuredInspiration', () => {
  it('is null for a retro drawer', () => {
    expect(getStructuredInspiration(retro)).toBeNull()
  })

  it('is null for a team prompt with no composer', () => {
    expect(
      getStructuredInspiration({mode: 'teamPrompt', viewerResponse: null, composer: null, prompts})
    ).toBeNull()
  })

  it('is null for a team prompt with no prompts', () => {
    expect(
      getStructuredInspiration({
        mode: 'teamPrompt',
        viewerResponse: null,
        composer,
        prompts: []
      })
    ).toBeNull()
  })

  it('returns the composer and prompts for a structured team prompt', () => {
    expect(
      getStructuredInspiration({mode: 'teamPrompt', viewerResponse: null, composer, prompts})
    ).toEqual({composer, prompts})
  })
})
