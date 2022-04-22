import {GQLType, MaybeReadonly} from '../types/generics'

const getPhaseByTypename = <TPhase extends {__typename: string}, T extends string>(
  phases: MaybeReadonly<TPhase[]>,
  typename: T
) => {
  const phase = phases.find((phase) => phase.__typename === typename)
  return phase as GQLType<TPhase, T>
}

export default getPhaseByTypename
