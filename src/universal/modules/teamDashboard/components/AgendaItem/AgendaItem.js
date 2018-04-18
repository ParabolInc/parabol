import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {DragSource as dragSource} from 'react-dnd';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import Avatar from 'universal/components/Avatar/Avatar';
import inAgendaGroup from 'universal/modules/meeting/helpers/inAgendaGroup';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {AGENDA_ITEM, phaseArray} from 'universal/utils/constants';
import {requestIdleCallback} from 'universal/utils/requestIdleCallback';
import styled, {css} from 'react-emotion';

const taskSource = {
  beginDrag(props) {
    return {
      id: props.agendaItem.id
    };
  }
};

const lineHeight = ui.navTopicLineHeight;

const DeleteIconButton = styled('div')(({agendaLength, disabled}) => ({
  color: appTheme.palette.warm,
  cursor: 'pointer',
  display: 'block',
  height: '1.5rem',
  // we can make the position of the del (x) more centered when there’s a low number of agenda items
  left: agendaLength < 10 ? '.8125rem' : ui.meetingSidebarGutter,
  lineHeight,
  // overrides hover state using !important only during disabled
  opacity: disabled ? '0 !important' : 0,
  position: 'absolute',
  textAlign: 'center',
  top: '.5rem',
  transition: 'opacity .1s ease-in',
  width: ui.iconSize
}));

const IndexBlock = styled('div')(({disabled}) => ({
  fontWeight: 400,
  height: '1.5rem',
  lineHeight,
  // overrides hover state using !important only during disabled
  opacity: disabled ? '.5 !important' : '.5',
  paddingRight: '.75rem',
  textAlign: 'right',
  width: ui.meetingSidebarGutterInner
}));

const ContentBlock = styled('div')({
  fontSize: appTheme.typography.s3,
  flex: 1,
  fontWeight: 400,
  lineHeight,
  position: 'relative',
  wordBreak: 'break-word',

  '&::before': {
    content: '"“"',
    display: 'block',
    position: 'absolute',
    right: '100%',
    textAlign: 'right',
    width: '1rem'
  }
});

const AvatarBlock = styled('div')({
  paddingLeft: '.5rem',
  width: '2rem'
});

const agendaTopicRootStyles = {
  rootBlock: {
    backgroundColor: 'transparent',
    color: ui.colorText,
    display: 'flex',
    fontSize: ui.navTopicFontSize,
    padding: '.5rem .5rem .5rem 0',
    position: 'relative',
    width: '100%',

    ':hover': {
      backgroundColor: appTheme.palette.light50l
    },
    ':hover > div': {
      opacity: 1
    },

    '::after': {
      backgroundColor: 'transparent',
      borderRadius: '100%',
      content: '""',
      display: 'block',
      left: '.875rem',
      marginTop: '-.1875rem',
      position: 'absolute',
      height: '.375rem',
      top: '50%',
      transition: 'opacity .1s ease-in',
      width: '.375rem'
    }
  },

  rootActiveLocal: {
    backgroundColor: ui.navMenuLightBackgroundColorActive,
    boxShadow: `inset ${ui.navMenuLeftBorderWidth} 0 0 ${ui.palette.mid}`
  },

  rootOutOfSync: {
    color: ui.palette.warm,
    '::after': {
      backgroundColor: ui.palette.warm
    },
    ':hover::after': {
      opacity: 0
    }
  },

  rootIsComplete: {
    opacity: '.5',
    ':hover': {
      opacity: '1'
    }
  },

  rootDisabled: {
    ':hover': {
      backgroundColor: 'transparent'
    }
  },

  rootIsCompleteDisabled: {
    ':hover': {
      opacity: '.5'
    }
  }
};

const agendaTopicLinkStyles = {
  linkBase: {
    color: ui.colorText,
    '&:hover,:focus': {
      color: ui.colorText,
      textDecoration: 'none'
    }
  },

  linkIsComplete: {
    textDecoration: 'line-through',
    '&:hover,:focus': {
      textDecoration: 'line-through'
    }
  },

  linkCanNavigate: {
    color: ui.palette.mid,
    '&:hover,:focus': {
      color: ui.palette.mid,
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  },

  linkActiveLocal: {
    color: ui.linkColor,
    '&:hover,:focus': {
      color: ui.linkColorHover
    }
  },

  linkOutOfSync: {
    color: ui.palette.warm,
    '&:hover,:focus': {
      color: ui.palette.warm
    }
  }
};

class AgendaItem extends Component {
  static propTypes = {
    agendaItem: PropTypes.object.isRequired,
    agendaLength: PropTypes.number.isRequired,
    canNavigate: PropTypes.bool,
    connectDragSource: PropTypes.func.isRequired,
    content: PropTypes.string,
    disabled: PropTypes.bool,
    ensureVisible: PropTypes.bool,
    handleRemove: PropTypes.func,
    idx: PropTypes.number,
    inSync: PropTypes.bool,
    isCurrent: PropTypes.bool,
    isComplete: PropTypes.bool,
    isFacilitator: PropTypes.bool,
    facilitatorPhase: PropTypes.oneOf(phaseArray),
    gotoAgendaItem: PropTypes.func,
    localPhase: PropTypes.oneOf(phaseArray),
    localPhaseItem: PropTypes.number,
    teamMember: PropTypes.object
  };

  componentDidMount() {
    if (this.props.ensureVisible) {
      requestIdleCallback(() => {
        // does not force centering; no animation for initial load
        this.el.scrollIntoViewIfNeeded();
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.ensureVisible && this.props.ensureVisible) {
      // without RIC only gets called ~20% of the time in Chrome64 on Ubuntu 16.04 if behavior: smooth
      requestIdleCallback(() => {
        this.el.scrollIntoView({behavior: 'smooth'});
      });
    }
  }

  el = null;

  render() {
    const {
      agendaItem,
      agendaLength,
      canNavigate,
      connectDragSource,
      disabled,
      idx,
      inSync,
      isCurrent,
      isFacilitator,
      handleRemove,
      localPhase,
      facilitatorPhase,
      gotoAgendaItem,
      localPhaseItem
    } = this.props;
    const {content, isComplete, teamMember = {}} = agendaItem;
    const isLocal = idx + 1 === localPhaseItem;
    const canDelete = !isComplete && !isCurrent && !disabled;
    const inAgendaGroupLocal = inAgendaGroup(localPhase);
    const inAgendaGroupFacilitator = inAgendaGroup(facilitatorPhase);

    // Root block styles
    const rootStyles = agendaTopicRootStyles;
    const addRootStyles = css(
      rootStyles.rootBlock,
      inAgendaGroupLocal && isLocal && rootStyles.rootActiveLocal,
      inAgendaGroupFacilitator && isFacilitator && !inSync && rootStyles.rootOutOfSync,
      isComplete && rootStyles.rootIsComplete,
      disabled && rootStyles.rootDisabled,
      isComplete && disabled && rootStyles.rootIsCompleteDisabled
    );

    // Content link styles
    const linkStyles = agendaTopicLinkStyles;
    const addLinkStyles = css(
      linkStyles.linkBase,
      isComplete && linkStyles.linkIsComplete,
      canNavigate && linkStyles.linkCanNavigate,
      inAgendaGroupLocal && isLocal && linkStyles.linkActiveLocal,
      inAgendaGroupFacilitator && isFacilitator && !inSync && linkStyles.linkOutOfSync
    );

    return connectDragSource(
      <div className={addRootStyles} title={content} ref={(el) => { this.el = el; }}>
        {canDelete &&
          <DeleteIconButton
            agendaLength={agendaLength}
            disabled={disabled}
            onClick={handleRemove}
          >
            <FontAwesome name="times-circle" />
          </DeleteIconButton>
        }
        <IndexBlock>{idx + 1}{'.'}</IndexBlock>
        <ContentBlock onClick={gotoAgendaItem}>
          <a className={addLinkStyles}>{content}</a>{'”'}
        </ContentBlock>
        <AvatarBlock>
          <Avatar hasBadge={false} picture={teamMember.picture} size="smallest" />
        </AvatarBlock>
      </div>
    );
  }
}

const dragSourceCb = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
});

export default createFragmentContainer(
  dragSource(AGENDA_ITEM, taskSource, dragSourceCb)(AgendaItem),
  graphql`
    fragment AgendaItem_agendaItem on AgendaItem {
      id
      content
      isComplete
      teamMember {
        picture
      }
    }`
);
