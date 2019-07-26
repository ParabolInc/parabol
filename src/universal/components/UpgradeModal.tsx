import {UpgradeModal_viewer} from '__generated__/UpgradeModal_viewer.graphql'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer, graphql} from 'react-relay'
import UpgradeSqueeze from 'universal/components/UpgradeSqueeze'
import UpgradeSuccess from 'universal/components/UpgradeSuccess'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {PRO} from 'universal/utils/constants'

interface Props extends WithAtmosphereProps {
  closePortal: () => void
  viewer: UpgradeModal_viewer
}

type State = {
  isPaid: boolean
}

class UpgradeModal extends React.Component<Props, State> {
  state = {
    isPaid: false
  }

  onSuccess = () => {
    // if switched too quickly, this will unmount before the modal click listener can verify that the button clicked is in fact in the modal
    setTimeout(() => {
      this.setState({
        isPaid: true
      })
    })
  }

  render () {
    const {isPaid} = this.state
    const {
      atmosphere,
      closePortal,
      viewer: {organization}
    } = this.props
    if (!organization) return null
    const handleClose = () => {
      closePortal()
      const {orgId} = organization
      commitLocalUpdate(atmosphere, (store) => {
        const organization = store.get(orgId)
        if (!organization) return
        organization.setValue(PRO, 'tier')
      })
    }
    return isPaid ? (
      <UpgradeSuccess handleClose={handleClose} />
    ) : (
      <UpgradeSqueeze organization={organization} onSuccess={this.onSuccess} />
    )
  }
}

export default createFragmentContainer(withAtmosphere(UpgradeModal), {
  viewer: graphql`
    fragment UpgradeModal_viewer on User {
      organization(orgId: $orgId) {
        orgId: id
        ...UpgradeSqueeze_organization
      }
    }
  `
})
