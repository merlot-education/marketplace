/*
 *  Copyright 2023-2024 Dataport AöR
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
