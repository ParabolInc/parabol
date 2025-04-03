import {_XLinearProjectResolvers} from '../resolverTypes'

export type _xLinearSource = {
  __typename: '_xLinearProject'
  service: 'linear'
  id: string
  nameWithTeam: string
}

const _xLinearProject: _XLinearProjectResolvers = {
  __isTypeOf: (source: Record<string, unknown>): source is _xLinearSource =>
    typeof source.id === 'string' && source.service === 'linear',
  service: () => 'linear'
}

export default _xLinearProject
