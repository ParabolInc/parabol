import PropTypes from 'prop-types'
import React from 'react'
import Type from 'universal/components/Type/Type'
import portal from 'react-portal-hoc'
import Avatar from 'universal/components/Avatar/Avatar'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import DashModal from 'universal/components/Dashboard/DashModal'
import styled from 'react-emotion'

const AvatarBlock = styled('div')({
  margin: '1.5rem auto',
  width: '6rem'
})

const ModalFooter = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%'
})

const PhotoUploadModal = (props) => {
  const {children, closeAfter, closePortal, isClosing, picture, unstyled} = props
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align='center' bold scale='s6' colorPalette='mid'>
        {'Upload a New Photo'}
      </Type>
      <AvatarBlock>
        <Avatar picture={picture} size='fill' sansRadius={unstyled} sansShadow={unstyled} />
      </AvatarBlock>
      {children}
      <ModalFooter>
        <FlatButton palette='warm' onClick={closePortal} size='medium'>
          <IconLabel icon='check-circle' iconAfter label='Done' />
        </FlatButton>
      </ModalFooter>
    </DashModal>
  )
}

PhotoUploadModal.propTypes = {
  children: PropTypes.any,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  picture: PropTypes.string,
  unstyled: PropTypes.bool
}

export default portal({escToClose: true, closeAfter: 100})(PhotoUploadModal)
