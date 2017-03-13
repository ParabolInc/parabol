import React, {PropTypes} from 'react';
import Row from 'universal/components/Row/Row';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import defaultStyles from 'universal/modules/notifications/helpers/styles';

const TeamArchived = (props) => {
  const {styles, varList} = props;
  const [teamName] = varList;
  return (
    <Row>
      <div className={css(styles.message)}>
        The team:
        <span className={css(styles.messageVar)}> {teamName} </span>
        was archived
      </div>
    </Row>
  );
};

TeamArchived.propTypes = {
  styles: PropTypes.object,
  varList: PropTypes.array.isRequired
};

const styleThunk = () => ({
  ...defaultStyles
});

export default withStyles(styleThunk)(TeamArchived);
