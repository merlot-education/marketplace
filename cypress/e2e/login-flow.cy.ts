/// <reference types="cypress" />

beforeEach(() => {
  cy.visit('http://localhost:4200/')
})

it('testuser can log in', () => {
  // user is not logged in at this point, check that the welcome text states the user is a visitor
  cy.get("#welcome-text").contains('Willkommen, Besucher!');

  // click login will redirect to keycloak, use testuser to login
  cy.get("#login-button").click();
  cy.origin('https://sso.common.merlot-education.eu', () => {
    cy.get("#username").type("testuser");
    cy.get("#password").type("testuser");
    cy.get("#kc-login").click();
  });

  // at this point we should be redirected again to the MPO and the welcome text should have changed and roles should be visible
  cy.get("#welcome-text").contains('Willkommen, test user!');
  cy.get("#role-select").should("be.visible");

  // logout again, after this the welcome text should be for a visitor again
  cy.get("#logout-button").click();
  cy.get("#welcome-text").contains('Willkommen, Besucher!');
})