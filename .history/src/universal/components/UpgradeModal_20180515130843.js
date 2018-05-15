// @flow
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import UpgradeSuccess from 'universal/components/UpgradeSuccess';
import UpgradeSqueeze from 'universal/components/UpgradeSqueeze';
import type {UpgradeModal_viewer as Viewer} from './__generated__/UpgradeModal_viewer.graphql';

type Props = {
  closePortal: () => void,
  viewer: Viewer
};

type State = {|
  isPaid: boolean
|}

class UpgradeModal extends React.Component<Props, State> {
  state = {
    isPaid: false
  }

  onSuccess = () => {
    setTimeout(() => {
      this.setState({
        isPaid: true
      });
    })
  };

  render() {
    const {isPaid} = this.state;
    const {closePortal, viewer: {organization}} = this.props;
    return isPaid ?
    <UpgradeSuccess closePortal={closePortal} /> :
    <UpgradeSqueeze organization={organization} onSuccess={this.onSuccess} />;
  }
}

export default createFragmentContainer(
  UpgradeModal,
  graphql`
    fragment UpgradeModal_viewer on User {
      organization(orgId: $orgId) {
        ...UpgradeSqueeze_organization
      }
    }
  `
);
