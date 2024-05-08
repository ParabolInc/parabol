import {RecordProxy} from 'relay-runtime'

const upgradeToTeamTierSuccessUpdater = (payload: RecordProxy) => {
  const organization = payload.getLinkedRecord('organization')
  if (organization) {
    organization.setValue(true, 'showConfetti')
    organization.setValue(true, 'showDrawer')
    organization.setValue('team', 'billingTier')
    organization.setValue('team', 'tier')
  }
}
export default upgradeToTeamTierSuccessUpdater
