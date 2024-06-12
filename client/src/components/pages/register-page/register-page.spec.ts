/* Autor: Niklas Lobo */

import { RegisterPage } from './register-page';
import { expect } from 'chai';
import { stub } from 'sinon';
import { HttpClient } from '../../../http-client';
import { AuthState } from '../login-page/auth-context';

describe('RegisterPage', () => {
  let registerPage: RegisterPage;

  beforeEach(() => {
    registerPage = new RegisterPage();
  });

  it('should validate username input', () => {
    const event = {
      target: {
        name: 'username',
        value: 'testUser'
      }
    } as unknown as InputEvent;

    registerPage.handleInput(event);

    expect(registerPage.username).to.equal('testUser');
    expect(registerPage.usernameErrorMessage).to.equal('');
  });

  it('should validate password input', () => {
    const event = {
      target: {
        name: 'password',
        value: 'Test@123'
      }
    } as unknown as InputEvent;

    registerPage.handleInput(event);

    expect(registerPage.password).to.equal('Test@123');
    expect(registerPage.passwordErrorMessage).to.equal('');
  });

  it('should handle form submission', async () => {
    const event = {
      preventDefault: stub()
    } as unknown as Event;

    registerPage.username = 'testUser';
    registerPage.password = 'Test@123';
    registerPage.confirmPassword = 'Test@123';
    registerPage.email = 'test@example.com';

    registerPage.httpClient = {
      post: stub().resolves({
        ok: true,
        json: stub().resolves({ token: 'testToken' })
      })
    } as unknown as HttpClient;

    const routerStub = stub(registerPage.router, 'goto');

    registerPage.authState = {
      isAuthenticated: false
    } as unknown as AuthState;

    await registerPage.handleSubmit(event);

    expect(registerPage.authState.isAuthenticated).to.be.true;
    expect(routerStub.calledWith('/fitness-home')).to.be.true;
  });
});
