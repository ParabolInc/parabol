import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import tinycolor from 'tinycolor2';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import Avatar from 'universal/components/Avatar/Avatar';

const combineStyles = StyleSheet.combineStyles;
const warmLinkHover = tinycolor(theme.palette.warm).darken(15).toHexString();
let s = {};

const AgendaItem = props => {
  const {desc, idx, handleRemove, isComplete, agendaPhaseItem, handleGoto, teamMember = {}} = props;
  const isCurrent = idx + 1 === agendaPhaseItem;
  const canDelete = !isComplete && !isCurrent;
  // const isMeeting = agendaPhaseItem !== undefined;
  const rootStyles = combineStyles(s.root, s[status]);
  let descStyles;
  if (isComplete) descStyles = s.strikethrough;
  if (isCurrent) descStyles = combineStyles(descStyles, s.descActive);
  // const descTrim = desc.replace(/\s+/g, '');

  return (
    <div className={rootStyles} title={desc}>
      {canDelete &&
        <div className={s.del} onClick={handleRemove}>
          <FontAwesome name="times-circle" style={{lineHeight: 'inherit'}}/>
        </div>
      }
      <div className={s.index}>{idx + 1}.</div>
      <div className={s.desc} onClick={handleGoto}>
        <a className={descStyles} >{desc}</a>”
      </div>
      <Avatar hasBadge={false} picture={teamMember.picture} size="smallest"/>
    </div>
  );
};

const block = {
  height: '1.5rem',
  lineHeight: '1.5rem'
};

const inlineBlock = {
  ...block,
  display: 'inline-block',
  verticalAlign: 'middle'
};

s = StyleSheet.create({
  root: {
    backgroundColor: 'transparent',
    color: theme.palette.cool,
    display: 'flex !important',
    fontSize: theme.typography.s3,
    padding: '.5rem .5rem .5rem 0',
    position: 'relative',
    width: '100%',

    ':hover': {
      backgroundColor: theme.palette.dark20l
    },
    ':focus': {
      backgroundColor: theme.palette.dark20l
    }
  },

  ib: {
    ...inlineBlock
  },

  del: {
    ...block,
    color: theme.palette.dark,
    cursor: 'pointer',
    left: '1.25rem',
    // paddingTop: '1px',
    position: 'absolute',
    top: '.5rem'
  },

  desc: {
    ...inlineBlock,
    flex: 1,
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    position: 'relative',
    cursor: 'pointer',

    '::before': {
      content: '"“"',
      display: 'block',
      position: 'absolute',
      right: '100%',
      textAlign: 'right',
      width: '1rem'
    }
  },

  descActive: {
    color: theme.palette.warm,
    ':hover': {
      color: warmLinkHover
    },
    ':focus': {
      color: warmLinkHover
    },
  },

  index: {
    ...inlineBlock,
    fontWeight: 700,
    paddingRight: '.75rem',
    paddingTop: '1px',
    textAlign: 'right',
    width: '4rem'
  },

  owner: {
    ...inlineBlock,
    fontWeight: 700,
    paddingTop: '1px',
    textAlign: 'right',
    width: '2rem'
  },

  active: {
    color: theme.palette.warm
  },

  processed: {
    opacity: '.5',

    ':hover': {
      opacity: '1'
    },
    ':focus': {
      opacity: '1'
    }
  },

  strikethrough: {
    textDecoration: 'line-through',

    ':hover': {
      textDecoration: 'underline'
    },
    ':focus': {
      textDecoration: 'underline'
    }
  }
});

AgendaItem.propTypes = {
  agendaPhaseItem: PropTypes.number,
  desc: PropTypes.string,
  idx: PropTypes.number,
  isCurrent: PropTypes.bool,
  isComplete: PropTypes.bool,
  handleGoto: PropTypes.func,
  handleRemove: PropTypes.func,
  owner: PropTypes.string,
  status: PropTypes.oneOf([
    'active',
    'onDrag',
    'onHover',
    'processed',
    'waiting'
  ]),
  teamMember: PropTypes.object
};

AgendaItem.defaultProps = {
  desc: 'pull request',
  index: 1,
  owner: 'MK',
  status: 'waiting'
};

export default look(AgendaItem);
