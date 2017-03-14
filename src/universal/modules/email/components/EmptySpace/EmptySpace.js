// EmptySpace:
// Table-based way to add vertical space. Uses line-height.

import React, {PropTypes} from 'react';
import ui from 'universal/styles/ui';

const EmptySpace = (props) => {
  const cellStyle = {
    lineHeight: `${props.height}px`,
    fontSize: '1px',
    msoLineHeightRule: 'exactly',
    padding: 0
  };

  return (
    <table style={ui.emailTableBase} width="100%">
      <tbody>
        <tr>
          <td
            dangerouslySetInnerHTML={{__html: '&nbsp;'}} // eslint-disable-line react/no-danger

            height={`${props.height}px`}
            style={cellStyle}
            width="100%"
          />
        </tr>
      </tbody>
    </table>
  );
};

EmptySpace.propTypes = {
  height: PropTypes.number
};

EmptySpace.defaultProps = {
  height: '16'
};

export default EmptySpace;
