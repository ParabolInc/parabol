import {GraphQLError} from 'graphql'
import appOrigin from '../../../appOrigin'
import {parsePageMarkdown} from '../parsePageMarkdown'
import {validatePageDoc} from '../validatePageDoc'

const assetUrl = `${appOrigin}/assets/a.png`
const outsideUrl = 'https://x.test/a.png'

const catchError = (fn: () => unknown) => {
  try {
    fn()
  } catch (e) {
    return e
  }
  return null
}

describe('parsePageMarkdown', () => {
  it('returns the blocks of valid markdown', () => {
    const blocks = parsePageMarkdown('# Title\n\nHello', new Set())
    expect(blocks.map(({type}) => type)).toEqual(['heading', 'paragraph'])
  })

  it('returns no blocks for empty markdown', () => {
    expect(parsePageMarkdown('  \n', new Set())).toEqual([])
  })

  it('rejects an image block without a src', () => {
    const error = catchError(() => parsePageMarkdown(':::imageBlock {}\n\n:::', new Set()))
    expect(error).toBeInstanceOf(GraphQLError)
    expect((error as GraphQLError).extensions.code).toBe('BAD_USER_INPUT')
    expect((error as GraphQLError).message).toContain('src')
  })

  it('rejects a text node directly under doc', () => {
    const error = catchError(() =>
      validatePageDoc({type: 'doc', content: [{type: 'text', text: 'loose'}]}, new Set())
    )
    expect(error).toBeInstanceOf(GraphQLError)
    expect((error as GraphQLError).extensions.code).toBe('BAD_USER_INPUT')
  })

  it('accepts an image hosted by Parabol', () => {
    const blocks = parsePageMarkdown(`![a](${assetUrl})`, new Set())
    expect(blocks.map(({type}) => type)).toEqual(['imageBlock'])
  })

  it('rejects an outside image unless the page already has it', () => {
    const error = catchError(() => parsePageMarkdown(`![a](${outsideUrl})`, new Set()))
    expect(error).toBeInstanceOf(GraphQLError)
    expect((error as GraphQLError).extensions.code).toBe('BAD_USER_INPUT')
    expect((error as GraphQLError).message).toContain('uploadUserAsset')
    expect((error as GraphQLError).message).not.toContain('upload_image')
    const blocks = parsePageMarkdown(`![a](${outsideUrl})`, new Set([outsideUrl]))
    expect(blocks.map(({type}) => type)).toEqual(['imageBlock'])
  })

  it('returns a valid ordered list for an image in a list item', () => {
    const blocks = parsePageMarkdown(`1. ![x](${assetUrl})`, new Set())
    expect(blocks.map(({type}) => type)).toEqual(['orderedList'])
    expect(blocks[0]!.content![0]!.content!.map(({type}) => type)).toEqual([
      'paragraph',
      'imageBlock'
    ])
  })

  it('rejects a root that is not a doc', () => {
    const error = catchError(() =>
      validatePageDoc({type: 'paragraph', content: [{type: 'text', text: 'hello'}]}, new Set())
    )
    expect(error).toBeInstanceOf(GraphQLError)
    expect((error as GraphQLError).extensions.code).toBe('BAD_USER_INPUT')
    expect((error as GraphQLError).message).toContain('whole page')
  })

  it('tells the caller how to fix an image with no src', () => {
    const error = catchError(() =>
      validatePageDoc({type: 'doc', content: [{type: 'imageBlock', attrs: {src: null}}]}, new Set())
    )
    expect((error as GraphQLError).message).toBe(
      'An image needs a src URL. Remove the image or give it a URL'
    )
  })
})
