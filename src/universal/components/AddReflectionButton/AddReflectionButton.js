/**
 * A button used to add a reflection during the reflect phase of the
 * retrospective meeting.
 *
 * @flow
 */
import React from 'react';
import styled from 'react-emotion';

import PlainButton from 'universal/components/PlainButton/PlainButton';

type Props = {
  handleClick: () => any
};

const AddReflectionButton = (props: Props) => (
  <PlainButton {...props} onClick={props.handleClick}>Add a reflection</PlainButton>
);

export default styled(AddReflectionButton)({
  textAlign: 'center',
  width: '20rem'
});
