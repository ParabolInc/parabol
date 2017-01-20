import React, {Component, PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import avatarDefaultUser from 'universal/styles/theme/images/avatar-user.png';
import avatarDefaultOrganization from 'universal/styles/theme/images/avatar-organization.png';

class FileInput extends Component {
  static propTypes = {
    buttonLabel: PropTypes.string,
    colorPalette: PropTypes.oneOf(ui.buttonColorPalette),
    forOrg: PropTypes.bool,
    input: PropTypes.object,
    meta: PropTypes.object.isRequired,
    picture: PropTypes.string,
    previousValue: PropTypes.string,
    size: PropTypes.oneOf(ui.buttonSizes),
    styles: PropTypes.object
  };

  static defaultProps = {
    buttonLabel: 'Upload',
    colorPalette: 'gray',
    size: 'small'
  };

  onChange(e) {
    const {input: {onChange}} = this.props;
    onChange(e.target.files[0]);
  }

  render() {
    const {
      forOrg,
      input: {value},
      meta: {touched, error},
      picture,
      previousValue,
      styles
    } = this.props;

    let errorString = error;
    if (typeof error === 'object') {
      errorString = Object.keys(error).map(k => error[k]).join(', ');
    }

    const fallbackAvatar = forOrg ? avatarDefaultUser : avatarDefaultOrganization;

    return (
      <div>
        <div className={css(styles.avatar)}>
          <div className={css(styles.control)}>
            <div className={css(styles.avatarEditOverlay)}>
              <FontAwesome name="pencil"/>
              <span>EDIT</span>
            </div>
            <input
              className={css(styles.input)}
              key={previousValue} // see: https://github.com/erikras/redux-form/issues/769
              type="file"
              value={value}
              onChange={(e) => this.onChange(e)}
            />
          </div>
          <img className={css(styles.avatarImg)} height={96} width={96} src={picture || fallbackAvatar}/>
        </div>
        {touched && error &&
          <FieldHelpText
            hasErrorText
            helpText={errorString}
            key={`${previousValue}Error`}
          />
        }
      </div>
    );
  }
}

const styleThunk = (customTheme, props) => ({
  control: {
    opacity: 0,
    overflow: 'hidden',
    left: 0,
    minHeight: '100%',
    minWidth: '100%',
    position: 'absolute',
    top: 0,

    ':hover': {
      opacity: '.75',
      transition: 'opacity .2s ease-in',
    }
  },

  input: {
    cursor: 'pointer',
    display: 'block',
    fontSize: '999px',
    filter: 'alpha(opacity=0)',
    minHeight: '100%',
    minWidth: '100%',
    opacity: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    top: 0
  },

  avatar: {
    height: 96,
    position: 'relative',
    width: 96
  },

  avatarEditOverlay: {
    alignItems: 'center',
    backgroundColor: appTheme.palette.dark,
    borderRadius: props.forOrg ? '.5rem' : '100%',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    height: 96,
    justifyContent: 'center',
    position: 'absolute',
    width: 96
  },

  avatarImg: {
    borderRadius: props.forOrg ? '.5rem' : '100%',
  }
});

export default withStyles(styleThunk)(FileInput);
