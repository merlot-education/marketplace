/// <reference types="cypress" />

beforeEach(() => {
  cy.visit('/')
})

it('testuser can log in', {
  defaultCommandTimeout: 10000
}, () => {
  // user is not logged in at this point, check that the welcome text states the user is a visitor
  cy.get("#welcome-text").contains('Willkommen, Besucher!');

  // click login will redirect to keycloak, use testuser to login
  cy.get("#login-button").click();

  cy.log("!!!!!!!!!!")
  cy.log("!!!!!!!!!!")
  cy.log("LOG IN AS Test User (Gaia-X) NOW")
  cy.log("!!!!!!!!!!")
  cy.log("!!!!!!!!!!")

  // at this point we should be redirected again to the MPO and the welcome text should have changed and roles should be visible
  cy.get("#welcome-text", {timeout: 70000}).contains('Willkommen, Test User!', {timeout: 70000});
  cy.get("#role-select").should("be.visible");

  // logout again, after this the welcome text should be for a visitor again
  cy.get("#logout-button").click();
  cy.get("#welcome-text").contains('Willkommen, Besucher!');
})
