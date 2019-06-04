import React from 'react';

import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }) => (

  <a onClick={firebase.doSignOut}>Logout</a>
);

export default withFirebase(SignOutButton);
