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
import findStageAfterId from 'universal/utils/meetings/findStageAfterId';
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation';
import {withRouter} from 'react-router-dom';
import type {RouterHistory} from 'react-router-dom';

type Props = {|
  atmosphere: Object,
  history: RouterHistory,
  gotoNext: () => void,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object,
|};

const CheckColumn = styled('div')({
  display: 'flex'
});

const CheckIcon = styled(StyledFontAwesome)(({color}) => ({
  color
}));

const PhaseWrapper = styled('div')({
  height: '100%'
});

const ReflectionSection = styled('div')({
  height: '50%'
});

const ReflectionGrid = styled('div')({
  display: 'flex',
  flexWrap: 'wrap'
});
const RetroDiscussPhase = (props: Props) => {
  const {atmosphere, gotoNext, history, team} = props;
  const {viewerId} = atmosphere;
  const {newMeeting, teamId} = team;
  const {facilitatorUserId, localStage: {localStageId, reflectionGroup}, meetingId, phases} = newMeeting || {};
  // reflection group will be null until the server overwrites the placeholder.
  if (!reflectionGroup) return null;
  const {reflectionGroupId, tasks, title, reflections, voteCount} = reflectionGroup;
  const isFacilitating = facilitatorUserId === viewerId;
  const checkMarks = [...Array(voteCount).keys()];
  const nextStageRes = findStageAfterId(phases, localStageId);
  const endMeeting = () => {
    EndNewMeetingMutation(atmosphere, {meetingId}, {history});
  };
  return (
    <React.Fragment>
      <PhaseWrapper>
        <ReflectionSection>
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
        </ReflectionSection>
        <MeetingAgendaCards
          meetingId={meetingId}
          reflectionGroupId={reflectionGroupId}
          tasks={tasks}
          teamId={teamId}
        />
      </PhaseWrapper>
      {isFacilitating &&
      <MeetingControlBar>
        {nextStageRes && <Button
          buttonSize="medium"
          buttonStyle="flat"
          colorPalette="dark"
          icon="arrow-circle-right"
          iconLarge
          iconPalette="warm"
          iconPlacement="right"
          label={'Done! Next topic'}
          onClick={gotoNext}
        />}
        <Button
          buttonSize="medium"
          buttonStyle="flat"
          colorPalette="dark"
          icon="arrow-circle-right"
          iconLarge
          iconPalette="warm"
          iconPlacement="right"
          label={'End Meeting'}
          onClick={endMeeting}
        />
      </MeetingControlBar>
      }
    </React.Fragment>
  );
};

export default createFragmentContainer(
  withRouter(withAtmosphere(RetroDiscussPhase)),
  graphql`
    fragment RetroDiscussPhase_team on Team {
      teamId: id
      newMeeting {
        ...ReflectionCard_meeting
        meetingId: id
        facilitatorUserId
        phases {
          stages {
            id
            ... on RetroDiscussStage {
              reflectionGroup {
                id
                tasks {
                  ...NullableTask_task
                }
              }
            }
          }
        }
        localPhase {
          stages {
            id
          }
        }
        localStage {
          localStageId: id
          ... on RetroDiscussStage {
            reflectionGroup {
              reflectionGroupId: id
              title
              voteCount
              reflections {
                id
                ...ReflectionCard_reflection
              }
              tasks {
                id
                reflectionGroupId
                createdAt
                sortOrder
                ...NullableTask_task
              }
            }
          }
        }
      }
    }
  `
);
