import {type TeamStructureLevelSource, toTeamStructureId} from '../../../reports/teamStructure'
import type {TeamStructureLevelResolvers} from '../resolverTypes'

export type {TeamStructureLevelSource}

const TeamStructureLevel: TeamStructureLevelResolvers = {
  id: ({id}) => toTeamStructureId(id, 'TeamStructureLevel')
}

export default TeamStructureLevel
