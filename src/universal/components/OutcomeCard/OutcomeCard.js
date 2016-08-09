import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import OutcomeCardTextarea from './OutcomeCardTextarea';
import OutcomeCardFooter from './OutcomeCardFooter';
import OutcomeCardStatusMenu from './OutcomeCardStatusMenu';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import TayaAvatar from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

const OutcomeCard = (props) => {
  const {
    content,
    status,
    hasOpenAssignMenu,
    hasOpenStatusMenu,
    isArchived,
    isProject,
    timestamp
  } = props;

  let rootStyles;
  const rootStyleOptions = [styles.root, styles.cardBlock];
  if (isProject) {
    rootStyleOptions.push(styles[status]);
  } else {
    rootStyleOptions.push(styles.isAction);
  }
  rootStyles = combineStyles.apply(null, rootStyleOptions);

  return (
    <div className={rootStyles}>
      {/* card main */}
      {hasOpenStatusMenu &&
        <OutcomeCardStatusMenu isArchived={isArchived} status={status} />
      }
      {!hasOpenAssignMenu && !hasOpenStatusMenu &&
        <div className={styles.body}>
          <div className={styles.timestamp}>
            {timestamp}
          </div>
          <OutcomeCardTextarea content={content} isProject={isProject} />
        </div>
      }
      {/* card footer */}
      <OutcomeCardFooter {...props} />
    </div>
  );
};

OutcomeCard.propTypes = {
  content: PropTypes.string,
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  openStatusMenu: PropTypes.func,
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  owner: PropTypes.object,
  team: PropTypes.object,
  timestamp: PropTypes.string,
  showByTeam: PropTypes.bool
};

OutcomeCard.defaultProps = {
  content: 'Parabol website updated',
  status: labels.projectStatus.active.slug,
  openStatusMenu() {
    console.log('openStatusMenu');
  },
  hasOpenAssignMenu: false,
  hasOpenStatusMenu: false,
  isArchived: false,
  isProject: true,
  owner: {
    preferredName: 'Taya Mueller',
    picture: TayaAvatar
  },
  team: {
    preferredName: 'Engineering',
    picture: 'https://placekitten.com/g/24/24'
  },
  timestamp: '1 day ago',
  showByTeam: false
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.5rem',
    borderTop: `.25rem solid ${theme.palette.mid}`,
    maxWidth: '20rem',
    width: '100%'
  },

  cardBlock: {
    marginBottom: '1rem',
    width: '100%'
  },

  body: {
    // TODO: set minHeight? (TA)
    width: '100%'
  },

  isAction: {
    backgroundColor: theme.palette.light50l
  },

  timestamp: {
    color: theme.palette.dark,
    fontSize: theme.typography.s1,
    fontWeight: 700,
    lineHeight: theme.typography.s3,
    padding: '.5rem',
    textAlign: 'right'
  },

  // Status theme colors

  ...projectStatusStyles('borderTopColor')
});

export default look(OutcomeCard);
