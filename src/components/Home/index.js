import React from 'react';
import { compose } from 'recompose';

import { withAuthorization, withEmailVerification, withAuthentication } from '../Session';
import Messages from '../Messages';

// import firebase from '../Firebase/index';

import App from '../App'

const HomePage = () => (
  <div>
    <App />
  </div>
);

// export default HomePage

// const condition = authUser => !!authUser;
const condition = authUser => true;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(HomePage);
