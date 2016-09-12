import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';

import ShortcutsToggle from 'universal/modules/team/components/ShortcutsToggle/ShortcutsToggle';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';

let s = {};

const MeetingAgendaLastCall = (props) => {
  const {
    agendaItemCount,
    actionCount,
    projectCount
    // router,
    // team
  } = props;
  // const {id: teamId} = team;
  // const phaseItemFactory = makePhaseItemFactory(isFacilitating, 0, router, teamId, FIRST_CALL);
  // const gotoNextItem = phaseItemFactory(1);

  return (
    <MeetingLayout>
      <MeetingMain>
        <MeetingSection flexToFill paddingBottom="2rem">
          <MeetingSection paddingBottom="2rem">
            <MeetingPhaseHeading>Boom!</MeetingPhaseHeading>
            <Type align="center" bold family="serif" marginBottom="2.25rem" marginTop="2rem" scale="s5" theme="black">
              We worked on <span className={s.highlight}>{agendaItemCount} Agenda Items </span>
              resulting in <span className={s.highlight}>{actionCount} Actions </span>
              and <span className={s.highlight}>{projectCount} projects</span>.
            </Type>
            <Type align="center" marginBottom="2.75rem" scale="s4" theme="black">
              Anybody have <b><i>additional Agenda Items</i></b>?<br />
              If so, just press “<span className={s.highlight}><b>+</b></span>” or{' '}
              <span className={s.highlight}>add another Agenda Item</span>.<br />
              If not, you can end the meeting to see a summary.
            </Type>
            <Button
              label="End Meeting"
              size="largest"
              style="outlined"
              theme="cool"
            />
          </MeetingSection>
        </MeetingSection>
      </MeetingMain>
      <ShortcutsToggle />
    </MeetingLayout>
  );
};

MeetingAgendaLastCall.propTypes = {
  agendaItemCount: PropTypes.number,
  actionCount: PropTypes.number,
  projectCount: PropTypes.number,
  localPhaseItem: PropTypes.number,
  isFacilitating: PropTypes.bool,
  router: PropTypes.object.isRequired,
  team: PropTypes.object
};

s = StyleSheet.create({
  highlight: {
    color: theme.palette.warm
  }
});

export default look(MeetingAgendaLastCall);
