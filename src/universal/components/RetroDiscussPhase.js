// @flow
import * as React from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import Button from 'universal/components/Button/Button';
import appTheme from 'universal/styles/theme/appTheme';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards';

type Props = {|
  atmosphere: Object,
  gotoNext: () => void,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object,
|};

const CheckColumn = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center'
});

const CheckIcon = styled(StyledFontAwesome)(({color}) => ({
  color
}));

const DiscussPhaseWrapper = styled('div')({
  display: 'flex',
  height: '100%',
  justifyContent: 'space-around',
  width: '100%'
});

const ReflectionGrid = styled('div')({})
const RetroDiscussPhase = (props: Props) => {
  const {atmosphere: {viewerId}, gotoNext, team} = props;
  const {newMeeting} = team;
  const {facilitatorUserId, localStage: {reflectionGroup}} = newMeeting || {};
  // reflection group will be null until the server overwrites the placeholder.
  if (!reflectionGroup) return null;
  const {reflectionGroupId, title, reflections, voteCount} = reflectionGroup;
  const isFacilitating = facilitatorUserId === viewerId;
  const checkMarks = [...Array(voteCount).keys()];
  return (
    <React.Fragment>
      <div>{`"${title}"`}</div>
      <CheckColumn>
        {checkMarks.map((idx) => <CheckIcon key={idx} name="check" color={appTheme.brand.primary.midGray} />)}
      </CheckColumn>
      <ReflectionGrid>
        {reflections.map((reflection) => {
          return (
            <ReflectionCard key={reflection.id} meeting={newMeeting} reflection={reflection} />
          );
        })}
      </ReflectionGrid>
      <hr />
      <MeetingAgendaCards
        agendaId={reflectionGroupId}
        tasks={[]}
        teamId={team.id}
      />
      {isFacilitating &&
      <MeetingControlBar>
        <Button
          buttonSize="medium"
          buttonStyle="flat"
          colorPalette="dark"
          icon="arrow-circle-right"
          iconLarge
          iconPalette="warm"
          iconPlacement="right"
          label={'Done! Next topic'}
          onClick={gotoNext}
        />
      </MeetingControlBar>
      }
    </React.Fragment>
  );
};

export default createFragmentContainer(
  withAtmosphere(RetroDiscussPhase),
  graphql`
    fragment RetroDiscussPhase_team on Team {
      newMeeting {
        ...ReflectionCard_meeting
        meetingId: id
        facilitatorUserId
        localStage {
          ... on RetroDiscussStage {
            reflectionGroup {
              reflectionGroupId: id
              title
              voteCount
              reflections {
                id
                ...ReflectionCard_reflection
              }
            }
          }
        }
      }
    }
  `
);
