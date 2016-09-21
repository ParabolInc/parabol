import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {withRouter} from 'react-router';
import theme from 'universal/styles/theme';

import Avatar from 'universal/components/Avatar/Avatar';
import IconLink from 'universal/components/IconLink/IconLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
// eslint-disable-next-line max-len
import MeetingSectionSubheading from 'universal/modules/meeting/components/MeetingSectionSubheading/MeetingSectionSubheading';
import MeetingAgendaCardsContainer from 'universal/modules/meeting/containers/MeetingAgendaCards/MeetingAgendaCardsContainer';
import makePhaseItemFactory from 'universal/modules/meeting/helpers/makePhaseItemFactory';
import {AGENDA_ITEMS} from 'universal/utils/constants';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {cashay} from 'cashay';
import withHotkey from 'react-hotkey-hoc';

let s = {};

const MeetingAgendaItems = (props) => {
  const {
    agenda,
    bindHotkey,
    isFacilitating,
    localPhaseItem,
    members,
    router,
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
  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        {/* */}
        <MeetingSection paddingBottom="2rem">
          <MeetingSectionHeading>
            Whatcha need?
          </MeetingSectionHeading>
          <MeetingSectionSubheading>
            <b>Actions</b>: quick tasks<br />
            <b>Projects</b>: tracked outcomes<br />
          </MeetingSectionSubheading>
        </MeetingSection>
        {/* */}
        <div className={s.layout}>
          <div className={s.nav}>
            <div className={s.linkSpacer}>{' '}</div>
            <div className={s.avatar}>
              <Avatar {...currentTeamMember} size="large"/>
              <div className={s.requestLabel}>
                “{agendaItem.content}”
              </div>
            </div>
            <div className={s.linkSpacer}>
              <IconLink
                icon="arrow-circle-right"
                iconPlacement="right"
                label="Next Agenda Item"
                onClick={gotoNextItem}
              />
            </div>
          </div>
          <MeetingAgendaCardsContainer
            agendaId={agendaItem.id}
            myTeamMemberId={self && self.id}
          />
        </div>
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

s = StyleSheet.create({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '0 2rem',
    width: '100%'
  },

  nav: {
    display: 'flex !important',
    width: '100%'
  },

  avatar: {
    flex: 1,
    textAlign: 'center'
  },

  linkSpacer: {
    paddingTop: '2px',
    textAlign: 'right',
    width: '9.25rem'
  },

  requestLabel: {
    color: theme.palette.dark,
    display: 'inline-block',
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s5,
    fontStyle: 'italic',
    fontWeight: 700,
    marginLeft: '1.5rem',
    verticalAlign: 'middle'
  }
});

MeetingAgendaItems.propTypes = {
  agenda: PropTypes.array.isRequired,
  bindHotkey: PropTypes.func,
  isFacilitating: PropTypes.bool,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array,
  meetingPhase: PropTypes.string.isRequired,
  meetingPhaseItem: PropTypes.number.isRequired,
  params: PropTypes.shape({
    teamId: PropTypes.string.isRequired
  }).isRequired,
  team: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

export default withHotkey(withRouter(look(MeetingAgendaItems)));
