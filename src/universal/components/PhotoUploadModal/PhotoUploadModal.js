import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';
import brandMark from 'universal/styles/theme/images/brand/mark-color.svg';
import OrgAvatar from 'universal/modules/userDashboard/components/OrgAvatar/OrgAvatar';

const PhotoUploadModal = (props) => {
  const {currentPhoto, onBackdropClick} = props;
  const handleClick = () => {
    const variables = {teamMemberId};
    cashay.mutate('removeTeamMember', {variables});
  };
  const picture = currentPhoto || brandMark;
  return (
    <DashModal onBackdropClick={onBackdropClick}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Upload a new photo
      </Type>
      <img height={96} width={96} src={picture}/>
      <div>
        <OrgAvatar picture={picture}/>
      </div>
    </DashModal>
  );
};

PhotoUploadModal.propTypes = {
  onBackdropClick: PropTypes.func,
};

export default PhotoUploadModal;
