import {GraphQLError} from 'graphql'
import {parseMarkdownBlocks} from '../../../../client/shared/tiptap/parseMarkdownBlocks'
import {parseMarkdownContent, parsePageMarkdown} from '../parsePageMarkdown'

jest.mock('../../../../client/shared/tiptap/parseMarkdownBlocks')

const mockedParse = jest.mocked(parseMarkdownBlocks)

const catchError = (fn: () => unknown) => {
  try {
    fn()
  } catch (e) {
    return e
  }
  return null
}

describe('parseMarkdownContent', () => {
  it('reports a plain parse failure as bad input', () => {
    mockedParse.mockImplementation(() => {
      throw new Error('Invalid text node in JSON')
    })
    const error = catchError(() => parseMarkdownContent('anything'))
    expect(error).toBeInstanceOf(GraphQLError)
    expect((error as GraphQLError).extensions.code).toBe('BAD_USER_INPUT')
    expect((error as GraphQLError).message).toBe('The content could not be parsed as markdown')
  })

  it('reports a plain parse failure from parsePageMarkdown as bad input', () => {
    mockedParse.mockImplementation(() => {
      throw new RangeError('Unknown node type: mystery')
    })
    const error = catchError(() => parsePageMarkdown('anything', new Set()))
    expect(error).toBeInstanceOf(GraphQLError)
    expect((error as GraphQLError).extensions.code).toBe('BAD_USER_INPUT')
  })

  it('rethrows a GraphQLError unchanged', () => {
    const original = new GraphQLError('nope', {extensions: {code: 'FORBIDDEN'}})
    mockedParse.mockImplementation(() => {
      throw original
    })
    expect(catchError(() => parseMarkdownContent('anything'))).toBe(original)
  })
})
