import {type OrgStructureLevelSource, toOrgStructureId} from '../../../reports/orgStructure'
import type {OrgStructureLevelResolvers} from '../resolverTypes'

export type {OrgStructureLevelSource}

const OrgStructureLevel: OrgStructureLevelResolvers = {
  id: ({id}) => toOrgStructureId(id, 'OrgStructureLevel')
}

export default OrgStructureLevel
