import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import {createFragmentContainer} from 'react-relay';
import styled from 'react-emotion';
import {UserDraggingHeader_user as User} from './__generated__/UserDraggingHeader_user.graphql';

type Props = {
  user: User
}

const Header = styled('div')({
  bottom: '100%',
  color: appTheme.palette.warm,
  fontSize: '.6875rem',
  lineHeight: '1.125rem',
  position: 'absolute',
  right: 0,
  textAlign: 'end'
});

const UserDraggingHeader = (props: Props) => {
  const {user} = props;
  if (!user) return null;
  const {preferredName} = user;
  return (
    <Header>
      {preferredName}
    </Header>
  );
};

export default createFragmentContainer(
  UserDraggingHeader,
  graphql`
    fragment UserDraggingHeader_user on User {
      preferredName
    }
  `
);
