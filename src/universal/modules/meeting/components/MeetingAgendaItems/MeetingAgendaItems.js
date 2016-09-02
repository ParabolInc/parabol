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
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards';
import makePhaseItemFactory from 'universal/modules/meeting/helpers/makePhaseItemFactory';
import {LAST_CALL, phaseOrder} from 'universal/utils/constants';

let s = {};

const MeetingAgendaItems = (props) => {
  const {
    agenda,
    isFacilitating,
    localPhaseItem,
    members,
    router,
    team
  } = props;
  const {id: teamId, meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = team;
  const currentAgendaItem = agenda[localPhaseItem - 1];
  const currentTeamMember = members.find((m) => m.id === currentAgendaItem.teamMemberId);
  const phaseItemFactory = makePhaseItemFactory(isFacilitating, agenda.length, router, teamId, LAST_CALL);
  // const self = members.find(m => m.isSelf);
  // const isComplete = phaseOrder(meetingPhase) > phaseOrder(UPDATES);
  const gotoNextItem = phaseItemFactory(localPhaseItem + 1);

  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        {/* */}
        <MeetingSection paddingBottom="2rem">
          <MeetingSectionHeading>
            What do you need?
          </MeetingSectionHeading>
          <MeetingSectionSubheading>
            Request new Projects and Actions
          </MeetingSectionSubheading>
        </MeetingSection>
        {/* */}
        <div className={s.layout}>
          <div className={s.nav}>
            <div className={s.linkSpacer}>{' '}</div>
            <div className={s.avatar}>
              <Avatar {...currentTeamMember} hasLabel labelRight size="large"/>
              <div className={s.requestLabel}>
                “{currentAgendaItem.content}”
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
          <MeetingAgendaCards />
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

export default withRouter(look(MeetingAgendaItems));
