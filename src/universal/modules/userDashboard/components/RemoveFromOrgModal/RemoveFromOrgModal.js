import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import Button from 'universal/components/Button/Button';
import {DashModal} from 'universal/components/Dashboard';
import Type from 'universal/components/Type/Type';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import RemoveOrgUserMutation from 'universal/mutations/RemoveOrgUserMutation';
import withMutationProps from 'universal/utils/relay/withMutationProps';

const RemoveFromOrgModal = (props) => {
  const {
    atmosphere,
    closeAfter,
    closePortal,
    isClosing,
    onError,
    onCompleted,
    submitting,
    submitMutation,
    orgId,
    preferredName,
    userId
  } = props;
  const handleClick = () => {
    submitMutation();
    RemoveOrgUserMutation(atmosphere, orgId, userId, onError, onCompleted);
  };
  return (
    <DashModal closeAfter={closeAfter} closePortal={closePortal} isClosing={isClosing} onBackdropClick={closePortal}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold marginBottom="1.5rem" scale="s4">
        This will remove {preferredName} from the organization.
        Any outstanding tasks will be given to the team leads.
        Any time remaining on their subscription will be refunded on the next invoice.
        <br />
      </Type>
      <Button
        buttonStyle="flat"
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={`Remove ${preferredName}`}
        onClick={handleClick}
        buttonSize="large"
        waiting={submitting}
      />
    </DashModal>
  );
};

RemoveFromOrgModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.any,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  orgId: PropTypes.string.isRequired,
  preferredName: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  error: PropTypes.any,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default withAtmosphere(withMutationProps(portal({escToClose: true, closeAfter: 100})(RemoveFromOrgModal)));
