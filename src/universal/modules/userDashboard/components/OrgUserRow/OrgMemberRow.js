import React from 'react';
import {Avatar, Row, RowActions, RowInfo, RowInfoHeader, RowInfoHeading, RowInfoLink, Tag} from 'universal/components';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import {showError, showInfo} from 'universal/modules/toast/ducks/toastDuck';
import InactivateUserMutation from 'universal/mutations/InactivateUserMutation';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import {PERSONAL} from 'universal/utils/constants';
import Toggle from 'universal/components/Toggle/Toggle';
import LoadableMenu from 'universal/components/LoadableMenu';
import Button from 'universal/components/Button/Button';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';
import {createFragmentContainer} from 'react-relay';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {connect} from 'react-redux';
import LoadableBillingLeaderActionMenu from 'universal/components/LoadableBillingLeaderActionMenu';
import Tooltip from 'universal/components/Tooltip/Tooltip';

const originAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
};


const ActionsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
});

const MenuToggleBlock = styled('div')({
  marginLeft: ui.rowGutter,
  width: '1.5rem'
});

const ToggleBlock = styled('div')({
  marginLeft: ui.rowGutter,
  width: '6.25rem'
});

const menuButtonProps = {
  buttonSize: 'small',
  buttonStyle: 'flat',
  colorPalette: 'dark',
  icon: 'ellipsis-v',
  isBlock: true,
  size: 'smallest'
};

const OrgMemberRow = (props) => {
  const {
    atmosphere,
    billingLeaderCount,
    dispatch,
    submitMutation,
    onError,
    onCompleted,
    orgMember,
    organization
  } = props;
  const {orgId, isViewerBillingLeader, tier} = organization;
  const {user, isBillingLeader} = orgMember;
  const {email, inactive, picture, preferredName, userId} = user;
  const isPersonalTier = tier === PERSONAL;
  const isViewerLastBillingLeader = isViewerBillingLeader && isBillingLeader && billingLeaderCount === 1;
  const {viewerId} = atmosphere;

  const toggleHandler = () => {
    if (isPersonalTier) return;
    if (!inactive) {
      submitMutation();
      const handleError = (error) => {
        dispatch(showError({
          title: 'Oh no',
          message: error || 'Cannot pause user'
        }));
        onError(error);
      };
      InactivateUserMutation(atmosphere, userId, handleError, onCompleted);
    } else {
      dispatch(
        showInfo({
          title: 'We’ve got you covered!',
          message: 'We’ll reactivate that user the next time they log in so you don’t pay a penny too much'
        })
      );
    }
  };
  return (
    <Row>
      <div>
        {picture ?
          <Avatar hasBadge={false} picture={picture} size="small" /> :
          <img alt="" src={defaultUserAvatar} />
        }
      </div>
      <RowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{preferredName}</RowInfoHeading>
          {isBillingLeader &&
          <Tag colorPalette="blue" label="Billing Leader" />
          }
          {inactive && !isViewerBillingLeader &&
          <Tag colorPalette="midGray" label="Inactive" />
          }
        </RowInfoHeader>
        <RowInfoLink href={`mailto:${email}`} title="Send an email">
          {email}
        </RowInfoLink>
      </RowInfo>
      <RowActions>
        <ActionsBlock>
          {!isBillingLeader && viewerId === userId &&
          <LeaveOrgModal
            orgId={orgId}
            userId={userId}
            toggle={<Button
              buttonSize="small"
              buttonStyle="flat"
              colorPalette="dark"
              label="Leave Organization"
            />}
          />
          }
          {!isPersonalTier && isViewerBillingLeader &&
          <ToggleBlock>
            <Toggle
              active={!inactive}
              block
              disabled={isPersonalTier}
              label={inactive ? 'Inactive' : 'Active'}
              onClick={toggleHandler}
            />
          </ToggleBlock>
          }
          {isViewerLastBillingLeader && userId === viewerId &&
          <Tooltip
            tip={<div>{'You need to promote another Billing Leader'}<br />{'before you can leave this role or Organization.'}</div>}
            maxHeight={60}
            maxWidth={200}
            originAnchor={{vertical: 'top', horizontal: 'right'}}
            targetAnchor={{vertical: 'bottom', horizontal: 'right'}}
          >
            <MenuToggleBlock>
              {/* https://github.com/facebook/react/issues/4251 */}
              <Button {...menuButtonProps} visuallyDisabled />
            </MenuToggleBlock>
          </Tooltip>
          }
          {isViewerBillingLeader && !(isViewerLastBillingLeader && userId === viewerId) &&
          <MenuToggleBlock>
            <LoadableMenu
              LoadableComponent={LoadableBillingLeaderActionMenu}
              maxWidth={224}
              maxHeight={200}
              originAnchor={originAnchor}
              queryVars={{
                isViewerLastBillingLeader,
                orgMember,
                organization
              }}
              targetAnchor={targetAnchor}
              toggle={<Button {...menuButtonProps} />}
            />
          </MenuToggleBlock>
          }
        </ActionsBlock>
      </RowActions>
    </Row>
  );
};

export default createFragmentContainer(
  connect()(withAtmosphere(withMutationProps(OrgMemberRow))),
  graphql`
    fragment OrgMemberRow_organization on Organization {
      isViewerBillingLeader: isBillingLeader
      orgId: id
      tier
      ...BillingLeaderActionMenu_organization
    }
    fragment OrgMemberRow_orgMember on OrganizationMember {
      user {
        userId: id
        email
        inactive
        picture
        preferredName
      }
      isBillingLeader
      ...BillingLeaderActionMenu_orgMember
    }
  `
);
