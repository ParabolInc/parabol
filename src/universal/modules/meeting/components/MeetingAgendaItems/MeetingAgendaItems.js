import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {withRouter} from 'react-router';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';

import Avatar from 'universal/components/Avatar/Avatar';
import IconLink from 'universal/components/IconLink/IconLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingAgendaCardsContainer from 'universal/modules/meeting/containers/MeetingAgendaCards/MeetingAgendaCardsContainer';
import makePhaseItemFactory from 'universal/modules/meeting/helpers/makePhaseItemFactory';
import {AGENDA_ITEMS} from 'universal/utils/constants';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {cashay} from 'cashay';
import withHotkey from 'react-hotkey-hoc';

const MeetingAgendaItems = (props) => {
  const {
    agenda,
    bindHotkey,
    isFacilitating,
    localPhaseItem,
    members,
    router,
    styles,
    team
  } = props;
  const {id: teamId} = team;
  const agendaItem = agenda[localPhaseItem - 1];
  if (!agendaItem) {
    return <LoadingView />;
  }
  const currentTeamMember = members.find((m) => m.id === agendaItem.teamMemberId);
  const phaseItemFactory = makePhaseItemFactory(isFacilitating, agenda.length, router, teamId, AGENDA_ITEMS);
  const self = members.find(m => m.isSelf);
  const gotoNextItem = () => {
    const updatedAgendaItem = {
      id: agendaItem.id,
      isComplete: true
    };
    cashay.mutate('updateAgendaItem', {variables: {updatedAgendaItem}});
    phaseItemFactory(localPhaseItem + 1)();
  };
  const gotoPrevItem = phaseItemFactory(localPhaseItem - 1);
  bindHotkey(['enter', 'right'], gotoNextItem);
  bindHotkey('left', gotoPrevItem);
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
                  <Avatar {...currentTeamMember} size="fill"/>
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
                  label="Next Agenda Item"
                  onClick={gotoNextItem}
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
  agenda: PropTypes.object,
  bindHotkey: PropTypes.func,
  isFacilitating: PropTypes.bool,
  localPhaseItem: PropTypes.number,
  members: PropTypes.array,
  router: PropTypes.object,
  styles: PropTypes.object,
  team: PropTypes.object
};

const styleThunk = () => ({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '0 1rem 4rem',
    width: '100%',

    [ui.breakpoint.wide]: {
      paddingBottom: '6rem'
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

export default withHotkey(
  withRouter(
    withStyles(styleThunk)(
      MeetingAgendaItems)
  )
);
