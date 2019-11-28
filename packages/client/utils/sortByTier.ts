import {TierEnum} from '../types/graphql'

const sortByTier = <T extends readonly {tier: TierEnum | string; name: string}[]>(
  teamsOrOrgs: T
) => {
  const teamsSlice = teamsOrOrgs.slice()
  const tierVal = (team) =>
    team.tier === TierEnum.enterprise ? -2 : team.tier === TierEnum.pro ? -1 : 1
  teamsSlice.sort((a, b) =>
    tierVal(a) < tierVal(b)
      ? -1
      : tierVal(a) > tierVal(b)
      ? 1
      : a.name.toLowerCase() < b.name.toLowerCase()
      ? -1
      : 1
  )
  return (teamsSlice as unknown) as T
}

export default sortByTier
