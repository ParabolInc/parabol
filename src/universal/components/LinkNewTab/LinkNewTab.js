import React, {PropTypes} from 'react';

const LinkNewTab = (props) => {
  const { children, href, title } = props;

  return (
    <a
      href={href}
      target="_blank"
      title={title}
    >
      {children}
    </a>
  );
};

LinkNewTab.propTypes = {
  children: PropTypes.any,
  href: PropTypes.string,
  title: PropTypes.string
};

export default LinkNewTab;
