import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import OutcomeCardFooter from './OutcomeCardFooter';
import OutcomeCardStatusMenu from './OutcomeCardStatusMenu';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import TayaAvatar from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import {Field, reduxForm, initialize} from 'redux-form';
import OutcomeCardTextarea from './OutcomeCardTextarea';
import {cashay} from 'cashay';
import fromNow from 'universal/utils/fromNow';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

@reduxForm()
@look
export default class OutcomeCard extends Component {
  componentWillMount() {
    this.initializeValues(this.props.content);
  }

  componentWillReceiveProps(nextProps) {
    const {content} = this.props;
    const nextContent = nextProps.content;
    if (nextContent !== content) {
      this.initializeValues(nextContent);
    }
  }

  initializeValues(content) {
    const {form, projectId} = this.props;
    cashay.store.dispatch(initialize(form, {[projectId]: content}));
  }

  render() {
    const {
      content,
      status,
      hasOpenAssignMenu,
      hasOpenStatusMenu,
      isArchived,
      isProject,
      updatedAt,
      projectId,
      handleSubmit
    } = this.props;

    let rootStyles;
    const rootStyleOptions = [styles.root, styles.cardBlock];
    if (isProject) {
      rootStyleOptions.push(styles[status]);
    } else {
      rootStyleOptions.push(styles.isAction);
    }
    rootStyles = combineStyles.apply(null, rootStyleOptions);
    const handleCardUpdate = (submittedData) => {
      const submittedContent = submittedData[projectId];
      if (submittedContent !== content) {
        const options = {
          variables: {
            updatedTask: {
              id: projectId,
              content: submittedContent
            }
          }
        };
        cashay.mutate('updateTask', options);
      }
    };
    return (
      <div className={rootStyles}>
        {/* card main */}
        {hasOpenStatusMenu && <OutcomeCardStatusMenu isArchived={isArchived} status={status}/>}
        {!hasOpenAssignMenu && !hasOpenStatusMenu &&
          <div className={styles.body}>
            <form>
              <Field
                name={projectId}
                component={OutcomeCardTextarea}
                projectId={projectId}
                isProject={isProject}
                handleSubmit={handleSubmit(handleCardUpdate)}
                timestamp={fromNow(updatedAt)}
              />
            </form>
          </div>
        }
        {/* card footer */}
        <OutcomeCardFooter {...this.props} />
      </div>
    );
  }
}

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
  showByTeam: PropTypes.bool,
  updatedAt: PropTypes.instanceOf(Date),
  projectId: PropTypes.string,
  handleSubmit: PropTypes.func,
  form: PropTypes.string
};

OutcomeCard.defaultProps = {
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

  // Status theme colors

  ...projectStatusStyles('borderTopColor')
});
