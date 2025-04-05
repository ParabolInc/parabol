import {_XLinearProjectResolvers} from '../resolverTypes'

export type _xLinearSource = {
  __typename: '_xLinearProject'
  service: 'linear'
  id: string
}

const _xLinearProject: _XLinearProjectResolvers = {
  service: () => 'linear'
}

export default _xLinearProject
