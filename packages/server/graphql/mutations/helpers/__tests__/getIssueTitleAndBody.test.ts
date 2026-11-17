import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import type {DataLoaderWorker} from '../../../graphql'
import canAccessAI from '../canAccessAI'
import getIssueTitleAndBody from '../getIssueTitleAndBody'

jest.mock('../../../../utils/OpenAIServerManager')
jest.mock('../canAccessAI')

const generateIssueTitle = jest.fn()
const MockedManager = OpenAIServerManager as jest.MockedClass<typeof OpenAIServerManager>
const mockedCanAccessAI = canAccessAI as jest.MockedFunction<typeof canAccessAI>

const loadNonNull = jest.fn().mockResolvedValue({id: 't1', orgId: 'o1'})
const dataLoader = {get: () => ({loadNonNull})} as unknown as DataLoaderWorker

const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const doc = (...texts: string[]) => ({type: 'doc', content: texts.map(paragraph)})
const longText = 'wobble '.repeat(60).trim()

describe('getIssueTitleAndBody', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    MockedManager.mockImplementation(() => ({generateIssueTitle}) as unknown as OpenAIServerManager)
    mockedCanAccessAI.mockResolvedValue(true)
    generateIssueTitle.mockResolvedValue('Stop the widget wobbling')
  })

  it('uses the first block as the title without asking the AI', async () => {
    const res = await getIssueTitleAndBody(doc('Fix the widget', 'It wobbles'), 't1', dataLoader)
    expect(res).toEqual({title: 'Fix the widget', bodyContent: doc('It wobbles')})
    expect(mockedCanAccessAI).not.toHaveBeenCalled()
    expect(generateIssueTitle).not.toHaveBeenCalled()
  })

  it('creates no body when the title says it all', async () => {
    const res = await getIssueTitleAndBody(doc('Fix the widget'), 't1', dataLoader)
    expect(res).toEqual({title: 'Fix the widget', bodyContent: null})
  })

  it('generates a title and keeps the whole content when the first block is too long', async () => {
    const res = await getIssueTitleAndBody(doc(longText, 'It wobbles'), 't1', dataLoader)
    expect(res).toEqual({
      title: 'Stop the widget wobbling',
      bodyContent: doc(longText, 'It wobbles')
    })
    expect(generateIssueTitle).toHaveBeenCalledWith(`${longText}\n\nIt wobbles`, 255)
  })

  it('falls back to an excerpt when the AI has no answer', async () => {
    generateIssueTitle.mockResolvedValue(null)
    const {title, bodyContent} = await getIssueTitleAndBody(doc(longText), 't1', dataLoader)
    expect(title).toBe(longText.slice(0, 255))
    expect(bodyContent).toEqual(doc(longText))
  })

  it('never sends content to the AI when the org has turned it off', async () => {
    mockedCanAccessAI.mockResolvedValue(false)
    const {title} = await getIssueTitleAndBody(doc(longText), 't1', dataLoader)
    expect(title).toBe(longText.slice(0, 255))
    expect(generateIssueTitle).not.toHaveBeenCalled()
  })
})
