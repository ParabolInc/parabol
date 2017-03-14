import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';

import Avatar from 'universal/components/Avatar/Avatar';
import IconLink from 'universal/components/IconLink/IconLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingAgendaCardsContainer from 'universal/modules/meeting/containers/MeetingAgendaCards/MeetingAgendaCardsContainer';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const MeetingAgendaItems = (props) => {
  const {
    agendaItem,
    isLast,
    gotoNext,
    members,
    styles,
  } = props;
  if (!agendaItem) {
    return <LoadingView />;
  }
  const currentTeamMember = members.find((m) => m.id === agendaItem.teamMemberId);
  const self = members.find((m) => m.isSelf);
  const hasFirstSpacer = true;
  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <MeetingPrompt
            heading={<span>Whatcha need?</span>}
            helpText={<span><b>Actions</b>: quick tasks • <b>Projects</b>: tracked outcomes</span>}
          />
        </MeetingSection>
        {/* */}
        <MeetingSection flexToFill>
          <div className={css(styles.layout)}>
            <div className={css(styles.nav)}>
              {hasFirstSpacer && <div className={css(styles.linkSpacer)}>{' '}</div>}
              <div className={css(styles.avatarBlock)}>
                <div className={css(styles.avatar)}>
                  <Avatar {...currentTeamMember} size="fill" />
                </div>
                <div className={css(styles.agendaItemLabel)}>
                  “{agendaItem.content}”
                </div>
              </div>
              <div className={css(styles.linkSpacer)}>
                <IconLink
                  colorPalette="cool"
                  icon="arrow-circle-right"
                  iconPlacement="right"
                  label={isLast ? 'Wrap up the meeting' : 'Next Agenda Item'}
                  onClick={gotoNext}
                  scale="small"
                />
              </div>
            </div>
            <MeetingAgendaCardsContainer
              agendaId={agendaItem.id}
              myTeamMemberId={self && self.id}
            />
          </div>
        </MeetingSection>
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

MeetingAgendaItems.propTypes = {
  agendaItem: PropTypes.object.isRequired,
  isLast: PropTypes.bool,
  gotoNext: PropTypes.func.isRequired,
  members: PropTypes.array.isRequired,
  styles: PropTypes.object.isRequired
};

const styleThunk = () => ({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '0 .5rem 4rem',
    width: '100%',

    [ui.breakpoint.wide]: {
      paddingBottom: '0 1rem 6rem'
    },

    [ui.breakpoint.wider]: {
      paddingBottom: '8rem'
    },

    [ui.breakpoint.widest]: {
      paddingBottom: '12rem'
    }
  },

  nav: {
    display: 'flex !important',
    width: '100%'
  },

  avatarBlock: {
    flex: 1,
    textAlign: 'center',
    whiteSpace: 'nowrap'
  },

  avatar: {
    display: 'inline-block',
    verticalAlign: 'middle',
    width: '5rem',

    [ui.breakpoint.wider]: {
      width: '7.5rem'
    }
  },

  linkSpacer: {
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 1rem 0 2rem',
    justifyContent: 'center',
    textAlign: 'right',
    width: '12rem',

    [ui.breakpoint.wider]: {
      paddingTop: '6px'
    }
  },

  agendaItemLabel: {
    ...textOverflow,
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s5,
    fontStyle: 'italic',
    fontWeight: 700,
    marginLeft: '1.5rem',
    maxWidth: '40rem',
    verticalAlign: 'middle',

    [ui.breakpoint.wider]: {
      fontSize: appTheme.typography.s6
    }
  }
});

export default withStyles(styleThunk)(MeetingAgendaItems);
