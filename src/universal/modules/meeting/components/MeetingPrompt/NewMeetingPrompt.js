// @flow
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import Avatar from 'universal/components/Avatar/Avatar';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';

import type {NewMeetingPrompt_teamMember as TeamMember} from './__generated__/NewMeetingPrompt_teamMember.graphql';

const promptBreakpoint = ui.breakpoint.wider;
const MeetingPromptRoot = styled('div')({
  display: 'flex',
  overflow: 'hidden'
});

const Body = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '4.25rem',
  padding: '.75rem 1rem .75rem 0',

  [promptBreakpoint]: {
    minHeight: '5.25rem',
    padding: '1rem 1.5rem 1rem 0'
  }
});

const Heading = styled('div')({
  color: appTheme.palette.dark,
  fontSize: appTheme.typography.s5,
  fontWeight: 600,
  lineHeight: '1.5',
  margin: 0,
  padding: 0,
  width: '100%',

  [promptBreakpoint]: {
    fontSize: appTheme.typography.s6
  }
});

const SubHeading = styled('div')({
  color: appTheme.palette.dark90l,
  fontSize: appTheme.typography.s4,
  fontWeight: 600,
  lineHeight: '1.5',
  margin: 0,
  padding: 0,
  width: '100%',

  [promptBreakpoint]: {
    fontSize: appTheme.typography.s5
  }
});

const HelpText = styled('div')({
  color: appTheme.palette.dark90l,
  fontSize: appTheme.typography.s2,
  lineHeight: '1.5',
  margin: 0,
  padding: 0,
  width: '100%',

  [promptBreakpoint]: {
    fontSize: appTheme.typography.s3
  }
});

type Props = {
  avatarLarge: boolean,
  heading: any,
  helpText: any,
  subHeading: any,
  teamMember: TeamMember
};

const NewMeetingPrompt = (props: Props) => {
  const {
    avatarLarge,
    heading,
    helpText,
    subHeading,
    teamMember: {picture}
  } = props;

  const AvatarBlock = styled('div')({
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    padding: '.75rem',
    width: avatarLarge ? '8rem' : '6rem',

    [promptBreakpoint]: {
      padding: '1rem',
      width: avatarLarge ? '10rem' : '8rem'
    }
  });

  return (
    <MeetingPromptRoot>
      <AvatarBlock>
        <Avatar picture={picture || defaultUserAvatar} size="fill" />
      </AvatarBlock>
      <Body>
        <Heading>{heading}</Heading>
        {subHeading && <SubHeading>{subHeading}</SubHeading>}
        {helpText && <HelpText>{helpText}</HelpText>}
      </Body>
    </MeetingPromptRoot>
  );
};

export default createFragmentContainer(
  NewMeetingPrompt,
  graphql`
    fragment NewMeetingPrompt_teamMember on TeamMember {
      picture
    }
  `
);
