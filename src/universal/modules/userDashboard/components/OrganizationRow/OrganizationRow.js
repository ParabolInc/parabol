import PropTypes from 'prop-types';
import React from 'react';
import defaultOrgAvatar from 'universal/styles/theme/images/avatar-organization.svg';
import {PERSONAL, PRO, PRO_LABEL} from 'universal/utils/constants';
import withRouter from 'react-router-dom/es/withRouter';
import plural from 'universal/utils/plural';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import Row from 'universal/components/Row/Row';
import Avatar from 'universal/components/Avatar/Avatar';
import RowInfo from 'universal/components/Row/RowInfo';
import RowInfoHeader from 'universal/components/Row/RowInfoHeader';
import TagPro from 'universal/components/Tag/TagPro';
import RowInfoCopy from 'universal/components/Row/RowInfoCopy';
import RowActions from 'universal/components/Row/RowActions';
import Button from 'universal/components/Button/Button';
import TagBlock from 'universal/components/Tag/TagBlock';
import RowInfoHeading from 'universal/components/Row/RowInfoHeading';

const OrgAvatar = styled('div')({
  cursor: 'pointer'
});

const Name = styled(RowInfoHeading)({
  cursor: 'pointer'
});

const StyledTagBlock = styled(TagBlock)({
  marginLeft: '.125rem',
  marginTop: '-.5rem'
});

const OrganizationRow = (props) => {
  const {
    history,
    organization: {
      id: orgId,
      name,
      orgUserCount: {activeUserCount, inactiveUserCount},
      picture,
      tier
    }
  } = props;
  const orgAvatar = picture || defaultOrgAvatar;
  const onRowClick = () => history.push(`/me/organizations/${orgId}`);
  const totalUsers = activeUserCount + inactiveUserCount;
  const showUpgradeCTA = tier === PERSONAL;
  const upgradeCTALabel = (
    <span>
      {'Upgrade to '}
      <b>{PRO_LABEL}</b>
    </span>
  );
  return (
    <Row>
      <OrgAvatar onClick={onRowClick}>
        <Avatar size="fill" picture={orgAvatar} />
      </OrgAvatar>
      <RowInfo>
        <RowInfoHeader>
          <Name onClick={onRowClick}>
            {name}
            {tier === PRO && (
              <StyledTagBlock>
                <TagPro />
              </StyledTagBlock>
            )}
          </Name>
        </RowInfoHeader>
        <RowInfoCopy useHintCopy>
          {`${totalUsers} ${plural(totalUsers, 'User')} (${activeUserCount} Active)`}
        </RowInfoCopy>
      </RowInfo>
      <RowActions>
        {showUpgradeCTA && (
          <Button
            buttonStyle="flat"
            colorPalette={ui.upgradeColorOption}
            label={upgradeCTALabel}
            onClick={onRowClick}
            buttonSize="small"
          />
        )}
        <Button
          buttonStyle="flat"
          colorPalette="dark"
          label="Settings"
          icon="cog"
          onClick={onRowClick}
          buttonSize="small"
        />
      </RowActions>
    </Row>
  );
};

OrganizationRow.propTypes = {
  history: PropTypes.object.isRequired,
  organization: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    picture: PropTypes.string,
    tier: PropTypes.string.isRequired,
    orgUserCount: PropTypes.shape({
      activeUserCount: PropTypes.number.isRequired,
      inactiveUserCount: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
};

export default withRouter(OrganizationRow);
