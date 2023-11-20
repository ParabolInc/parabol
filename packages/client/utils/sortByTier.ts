import {TierEnum} from '~/__generated__/StandardHub_viewer.graphql'

const sortByTier = <T extends readonly {featureTier: TierEnum | string; name: string}[]>(
  teamsOrOrgs: T
) => {
  const teamsSlice = teamsOrOrgs.slice()
  const tierVal = (team: T[0]) =>
    team.featureTier === 'enterprise' ? -2 : team.featureTier === 'team' ? -1 : 1
  teamsSlice.sort((a, b) =>
    tierVal(a) < tierVal(b)
      ? -1
      : tierVal(a) > tierVal(b)
      ? 1
      : a.name.toLowerCase() < b.name.toLowerCase()
      ? -1
      : 1
  )
  return teamsSlice as unknown as T
}

export default sortByTier
