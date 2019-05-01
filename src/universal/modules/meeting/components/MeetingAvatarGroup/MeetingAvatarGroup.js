import {css} from 'aphrodite-local-styles/no-important'
import PropTypes from 'prop-types'
import React from 'react'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import withStyles from 'universal/styles/withStyles'
import {phaseArray} from 'universal/utils/constants'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {createFragmentContainer} from 'react-relay'
import AddTeamMemberAvatarButton from 'universal/components/AddTeamMemberAvatarButton'
import MeetingAvatarGroupItem from 'universal/modules/meeting/components/MeetingAvatarGroup/MeetingAvatarGroupItem'

const MeetingAvatarGroup = (props) => {
  const {gotoItem, isFacilitating, localPhase, localPhaseItem, styles, team} = props
  const {teamMembers} = team
  return (
    <div className={css(styles.meetingAvatarGroupRoot)}>
      <div className={css(styles.meetingAvatarGroupInner)}>
        {teamMembers.map((avatar, idx) => {
          return (
            <MeetingAvatarGroupItem
              key={avatar.id}
              gotoItem={gotoItem}
              isFacilitating={isFacilitating}
              avatar={avatar}
              idx={idx}
              team={team}
              localPhase={localPhase}
              localPhaseItem={localPhaseItem}
            />
          )
        })}
        <AddTeamMemberAvatarButton isMeeting team={team} teamMembers={teamMembers} />
      </div>
    </div>
  )
}

MeetingAvatarGroup.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  gotoItem: PropTypes.func.isRequired,
  isFacilitating: PropTypes.bool,
  localPhase: PropTypes.oneOf(phaseArray),
  localPhaseItem: PropTypes.number,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired
}

const borderActive = appTheme.brand.secondary.yellow
const borderLocal = appTheme.palette.mid30l
const boxShadowBase = '0 0 0 2px #fff, 0 0 0 4px'
const boxShadowWarm = `${boxShadowBase} ${borderActive}`
const boxShadowLocal = `${boxShadowBase} ${borderLocal}`

const styleThunk = () => ({
  meetingAvatarGroupRoot: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '1rem 0'
  },

  meetingAvatarGroupInner: {
    display: 'flex',
    position: 'relative',
    textAlign: 'center'
  },

  item: {
    marginLeft: '1rem',
    marginRight: '.25rem',
    position: 'relative'
  },

  itemReadOnly: {
    // Define
  },

  avatarBlock: {
    borderRadius: '100%',
    width: '2.25rem',

    [ui.breakpoint.wide]: {
      width: '2.5rem'
    },
    [ui.breakpoint.wider]: {
      width: '3rem'
    },
    [ui.breakpoint.widest]: {
      width: '4rem'
    },

    ':hover': {
      opacity: '.5'
    }
  },

  avatarBlockLocal: {
    boxShadow: boxShadowLocal
  },

  avatarBlockFacilitator: {
    boxShadow: boxShadowWarm
  },

  avatarBlockReadOnly: {
    boxShadow: 'none',

    ':hover': {
      opacity: '1'
    }
  },

  tagBlock: {
    bottom: '-1.75rem',
    left: '50%',
    paddingRight: ui.tagGutter,
    position: 'absolute',
    transform: 'translateX(-50%)'
  },

  tagBlockReadOnly: {
    // Define
  }
})

export default createFragmentContainer(
  withAtmosphere(withStyles(styleThunk)(MeetingAvatarGroup)),
  graphql`
    fragment MeetingAvatarGroup_team on Team {
      teamId: id
      activeFacilitator
      facilitatorPhase
      facilitatorPhaseItem
      ...AddTeamMemberAvatarButton_team
      teamMembers(sortBy: "checkInOrder") {
        ...AddTeamMemberAvatarButton_teamMembers
        id
        isCheckedIn
        isConnected
        isSelf
        picture
        ...MeetingAvatarMenu_avatar
      }
    }
  `
)
