// @flow
import * as React from 'react';
import styled from 'react-emotion';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import LoadableMenu from 'universal/components/LoadableMenu';
import LoadableDueDatePicker from 'universal/components/LoadableDueDatePicker';

const ClockIcon = styled(StyledFontAwesome)({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end'
});

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

type Props = {|
  task: Object
|}

class DueDateToggle extends React.Component<Props> {
  render() {
    const {task} = this.props;
    return (
      <LoadableMenu
        LoadableComponent={LoadableDueDatePicker}
        maxWidth={350}
        maxHeight={300}
        originAnchor={originAnchor}
        queryVars={{
          task
        }}
        targetAnchor={targetAnchor}
        toggle={<ClockIcon name="clock-o" />}
      />
    )
  }
};

export default DueDateToggle;
