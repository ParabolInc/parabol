import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import Panel from 'universal/components/Panel/Panel';
import Type from 'universal/components/Type/Type';

const CallOutPanel = (props) => {
  const {
    children,
    control,
    heading,
    styles
  } = props;

  return (
    <Panel hasHeader={false}>
      <div className={css(styles.panelBody)}>
        <Type align="center" bold marginBottom=".5rem" scale="s6">
          {heading}
        </Type>
        <Type align="center" marginBottom="1.5rem" scale="s4">
          {children}
        </Type>
        {control}
      </div>
    </Panel>
  );
};

CallOutPanel.propTypes = {
  children: PropTypes.any,
  control: PropTypes.any,
  heading: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  panelBody: {
    padding: `2rem ${ui.panelGutter}`,
    textAlign: 'center'
  }
});

export default withStyles(styleThunk)(CallOutPanel);
