import React, {PropTypes} from 'react';

const LinkNewTab = (props) => {
  const { children, href, title } = props;
  let url = href;
  // Add http protocol to url if no protocol was provided
  const urlProtocolRegex = new RegExp(/http:\/\/|https:\/\/|mailto:|ftp:\/\//);
  if (!href.match(urlProtocolRegex)) {
    url = `http://,${url}`;
  }
  return (
    <a
      href={url}
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
