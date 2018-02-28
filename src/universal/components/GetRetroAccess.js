import React from 'react';
import styled from 'react-emotion';

const ModalBoundary = styled('div')({
  width: 200,
  height: 200,
  background: 'white'
});

const GetRetroAccess = (props) => {
  return (
    <ModalBoundary>Pay me now</ModalBoundary>
  )
};

export default GetRetroAccess;
