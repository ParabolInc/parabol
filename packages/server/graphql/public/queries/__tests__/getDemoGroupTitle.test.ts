import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import getDemoGroupTitle from '../getDemoGroupTitle'

jest.mock('../../../../utils/OpenAIServerManager', () => ({
  __esModule: true,
  default: class {
    generateGroupTitle = async () => null
  }
}))

const resolve = getDemoGroupTitle
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const toContent = (text: string) =>
  JSON.stringify({type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text}]}]})

test('a demo group gets a title from its reflections when the AI returns none', async () => {
  const res = await resolve(
    {},
    {reflectionsContent: [toContent('Standups drag on forever'), toContent('Too many meetings')]},
    {} as GQLContext,
    {} as GraphQLResolveInfo
  )
  expect(res).toEqual({title: 'Standups drag forever'})
})
