import {css} from 'aphrodite-local-styles/no-important';
import React, {Component} from 'react';
import formError from 'universal/styles/helpers/formError';
import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';
import PropTypes from 'prop-types';

class ErrorMessageInMenu extends Component {
  static propTypes = {
    error: PropTypes.string.isRequired,
    styles: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.errorRef.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
  }

  render() {
    const {error, styles} = this.props;
    return (
      <div className={css(styles.error)} ref={(c) => { this.errorRef = c; }}>{error}</div>
    );
  }
}

const styleThunk = () => ({
  error: {
    ...formError,
    fontSize: appTheme.typography.s2,
    padding: '.5rem .5rem 0',
    textAlign: 'left'
  }
});

export default withStyles(styleThunk)(ErrorMessageInMenu);
