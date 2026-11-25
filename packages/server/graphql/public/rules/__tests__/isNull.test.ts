import type {GraphQLResolveInfo} from 'graphql'
import {and, not} from 'graphql-shield'
import {isNull} from '../isNull'

type ResolveArgs = Parameters<ReturnType<typeof isNull>['resolve']>

const resolveAgainst = (args: Record<string, unknown>) => {
  const rule = and(
    isNull<'Mutation.createPage'>('args.teamId'),
    not(isNull<'Mutation.createPage'>('args.parentPageId'))
  )
  const ctx = {_shield: {cache: {}}} as unknown as ResolveArgs[2]
  const options = {hashFunction: JSON.stringify} as unknown as ResolveArgs[4]
  return rule.resolve({}, args, ctx, {} as GraphQLResolveInfo, options)
}

test('two isNull checks on different arguments in one rule do not share a cached answer', async () => {
  expect(await resolveAgainst({parentPageId: 'page:1'})).toBe(true)
})

test('isNull is true for an argument left out and false for one that is passed', async () => {
  expect(await resolveAgainst({})).toBe(false)
  expect(await resolveAgainst({teamId: 'team1', parentPageId: 'page:1'})).toBe(false)
})
