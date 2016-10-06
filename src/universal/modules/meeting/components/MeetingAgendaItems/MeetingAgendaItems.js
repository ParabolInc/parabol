import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';

import Avatar from 'universal/components/Avatar/Avatar';
import IconLink from 'universal/components/IconLink/IconLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
// eslint-disable-next-line max-len
import MeetingSectionSubheading from 'universal/modules/meeting/components/MeetingSectionSubheading/MeetingSectionSubheading';
import MeetingAgendaCardsContainer from 'universal/modules/meeting/containers/MeetingAgendaCards/MeetingAgendaCardsContainer';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {cashay} from 'cashay';

const MeetingAgendaItems = (props) => {
  const {
    agendaItem,
    gotoNext,
    members,
    styles,
  } = props;
  if (!agendaItem) {
    return <LoadingView />;
  }
  const currentTeamMember = members.find((m) => m.id === agendaItem.teamMemberId);
  const self = members.find(m => m.isSelf);
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
        <div className={css(styles.layout)}>
          <div className={css(styles.nav)}>
            <div className={css(styles.linkSpacer)}>{' '}</div>
            <div className={css(styles.avatar)}>
              <Avatar {...currentTeamMember} size="large"/>
              <div className={css(styles.requestLabel)}>
                “{agendaItem.content}”
              </div>
            </div>
            <div className={css(styles.linkSpacer)}>
              <IconLink
                colorPalette="cool"
                icon="arrow-circle-right"
                iconPlacement="right"
                label="Next Agenda Item"
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
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

MeetingAgendaItems.propTypes = {
  agenda: PropTypes.object,
  isFacilitating: PropTypes.bool,
  localPhaseItem: PropTypes.number,
  members: PropTypes.array,
  styles: PropTypes.object,
  team: PropTypes.object
};

const styleThunk = () => ({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '0 1rem',
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
    padding: '2px 1rem 0',
    textAlign: 'right',
    width: '12rem'
  },

  requestLabel: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s5,
    fontStyle: 'italic',
    fontWeight: 700,
    marginLeft: '1.5rem',
    verticalAlign: 'middle'
  }
});

export default withStyles(styleThunk)(MeetingAgendaItems);
