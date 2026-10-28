import {type OrgStructureLevelSource, toOrgStructureKey} from '../../../reports/orgStructure'
import type {OrgStructureLevelResolvers} from '../resolverTypes'

export type {OrgStructureLevelSource}

const OrgStructureLevel: OrgStructureLevelResolvers = {
  id: ({id}) => toOrgStructureKey(id, 'OrgStructureLevel')
}

export default OrgStructureLevel
