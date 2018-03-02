/**
 * A button used to add a reflection during the reflect phase of the
 * retrospective meeting.
 *
 * @flow
 */
import React from 'react';
import styled from 'react-emotion';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import appTheme from 'universal/styles/theme/appTheme';

type Props = {
  handleClick: () => any
};

const Plus = styled(
  (props) => <span aria-hidden="true" {...props}>+</span>
)({
  paddingRight: '0.5rem'
});

const AddReflectionButton = (props: Props) => (
  <PlainButton {...props} onClick={props.handleClick}>
    <Plus /><span>Add a reflection</span>
  </PlainButton>
);

export default styled(AddReflectionButton)({
  border: `2px dashed ${appTheme.palette.mid30a}`,
  borderRadius: 3,
  color: appTheme.palette.dark,
  padding: '0.8rem',
  textAlign: 'center',
  width: '20rem'
});
