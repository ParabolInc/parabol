import PropTypes from 'prop-types';
import React from 'react';
import AsyncComponent from 'universal/components/AsyncComponent';
import typePicker from 'universal/modules/notifications/helpers/typePicker';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import withStyles from 'universal/styles/withStyles';
import formError from 'universal/styles/helpers/formError';
import {css} from 'aphrodite-local-styles';

const NotificationRow = (props) => {
  const {dispatch, error, submitting, submitMutation, onCompleted, onError, notification, styles} = props;
  const {type} = notification;
  const fetchMod = typePicker[type];
  return (
    <div>
      <AsyncComponent
        loadingWidth="inherit"
        loadingHeight="5rem"
        fetchMod={fetchMod}
        dispatch={dispatch}
        notification={notification}
        submitting={submitting}
        submitMutation={submitMutation}
        onCompleted={onCompleted}
        onError={onError}
      />
      {error && <div className={css(styles.error)}>{error}</div>}
    </div>
  );
};

NotificationRow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    orgId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
    // See the Notification interface for full list
  }),
  // mutationProps
  error: PropTypes.any,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  error: {
    ...formError
  }
});
export default withMutationProps(
  withStyles(styleThunk)(
    NotificationRow
  )
);
