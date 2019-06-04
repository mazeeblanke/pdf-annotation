import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

/* eslint-disable */

import { Button, Form, Grid, Header, Image, Message, Segment, Checkbox } from 'semantic-ui-react'

const SignUpPage = () => (
  <div>
    <h1>SignUp</h1>
    <SignUpForm />
  </div>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  password: '',
  // passwordOne: '',
  // passwordTwo: '',
  isAdmin: false,
  error: null,
};

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with this E-Mail address already exists.
  Try to login with this account instead. If you think the
  account is already used from one of the social logins, try
  to sign in with one of them. Afterward, associate your accounts
  on your personal account page.
`;

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { username, email, password, isAdmin } = this.state;
    const roles = {};

    if (isAdmin) {
      roles[ROLES.ADMIN] = ROLES.ADMIN;
    }

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, password)
      .then(authUser => {
        // Create a user in your Firebase realtime database
        return this.props.firebase.user(authUser.user.uid).set({
          username,
          email,
          isAdmin,
          roles,
        });
      })
      // .then(() => {
      //   return this.props.firebase.doSendEmailVerification();
      // })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  componentDidMount () {
    // this.props.history.push(ROUTES.HOME)
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onChangeCheckbox = (event, data) => {
    // console.log(event.target.name, data)
    this.setState({ 'isAdmin': data.checked });
  };

  render() {
    const {
      username,
      email,
      password,
      // passwordTwo,
      isAdmin,
      error,
    } = this.state;

    const isInvalid =
      // passwordOne !== passwordTwo ||
      // passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <Grid className="signin" textAlign='center' style={{ height: '50vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' color='black' textAlign='center'>
            Sign Up
          </Header>
          <Form onSubmit={this.onSubmit} size='large'>
            <Segment stacked>
              <Form.Input name="email" value={email} onChange={this.onChange} fluid icon='mail' iconPosition='left' placeholder='E-mail address' />
              <Form.Input name="username" value={username} onChange={this.onChange} fluid icon='user' iconPosition='left' placeholder='Username' />
              <Form.Input
                fluid
                name="password"
                icon='lock'
                onChange={this.onChange}
                iconPosition='left'
                placeholder='Password'
                type='password'
              />

              <Checkbox name="isAdmin" checked={isAdmin} onChange={this.onChangeCheckbox} label='Admin' />
              <br></br>
              <br></br>
              <Button  color='black' fluid size='large'>
                SignUp
              </Button>
              {error && <Header as='h6' color='red'>{error.message}</Header>}
            </Segment>
          </Form>
          <Message>
            Have an account? <Link to={ROUTES.SIGN_IN}>Sign In</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(
  withRouter,
  withFirebase,
)(SignUpFormBase);



export default SignUpPage;

export { SignUpForm, SignUpLink };
