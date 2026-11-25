import type {GraphQLResolveInfo} from 'graphql'
import {isSet} from '../isSet'

type ResolveArgs = Parameters<ReturnType<typeof isSet>['resolve']>

const isParentSet = (args: Record<string, unknown>) => {
  const ctx = {_shield: {cache: {}}} as unknown as ResolveArgs[2]
  const options = {hashFunction: JSON.stringify} as unknown as ResolveArgs[4]
  return isSet<'Mutation.createPage'>('args.parentPageId').resolve(
    {},
    args,
    ctx,
    {} as GraphQLResolveInfo,
    options
  )
}

test('an argument is set when it holds an id', async () => {
  expect(await isParentSet({parentPageId: 'page:1'})).toBe(true)
})

test.each([
  ['left out', {}],
  ['null', {parentPageId: null}],
  ['an empty string', {parentPageId: ''}]
])('an argument that is %s is not set', async (_name, args) => {
  expect(await isParentSet(args)).toBe(false)
})
