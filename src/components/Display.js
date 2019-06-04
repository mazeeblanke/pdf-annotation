import React from 'react';

const Display = (props) => {
  return (
    <div>
      {
        props.if
          ? (props.children)
          : null
      }
    </div>
  );
}

export default Display;