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


beforeEach(() => {
    cy.visit('/')
});
  
it('open organizations overview', {
    defaultCommandTimeout: 10000
  }, () => {

    // make sure there is "Organisationsverwaltung" and click on it
    cy.contains('Organisationsverwaltung').click()
    // make sure there is "Organisationen erkunden" and click on it
    cy.contains('Organisationen erkunden').click()
    // url should have updated
    cy.url().should('include', 'organization/explore')

    // make sure some organisations are there
    cy.contains('AWSi');
    cy.contains('imc AG');

    // look at card headers
    cy.get('c-card-header').then((headers) => {
        let headerNames = [];
        for (let h of headers) {
            headerNames.push(h.innerText);
        }
        let headerNamesSorted = [...headerNames].sort((a, b) => a.localeCompare(b));

        // make sure the organisations are sorted by name alphabetically
        for (let i = 0; i < headerNames.length; i++) {
            cy.wrap(headerNames[i]).should("equal", headerNamesSorted[i]);
        }
        
        // make sure there are max 9 organisations on this page
        cy.wrap(headers).should("have.length.at.most", 9);
    });

    // look at card bodies
    cy.get('c-card-body').then((bodies) => {
        for (let b of bodies) {
            // check for existence of fields and make sure their content isnt empty
            // since some organisations have no registration number, we can only check for existence of the header
            cy.wrap(b).contains("Registrierungsnummer:");
            cy.wrap(b).contains("Name der Organisation:").parent().then((id) => {
                cy.wrap(id.get(0).innerText.replace("Name der Organisation:\n", "")).should("not.be.empty");
            });
            cy.wrap(b).contains("Adresse:").parent().then((id) => {
                cy.wrap(id.get(0).innerText.replace("Adresse:\n", "")).should("not.be.empty");
            });
        }
    });

    // switch to page 2
    cy.get('m-paginator a').contains('2').click();

    // wait until we switched pages
    cy.get('c-card-header').first().should("not.contain", "AWSi");

    // repeat checking for headers and bodies
    // look at card headers
    cy.get('c-card-header').then((headers) => {
        let headerNames = [];
        for (let h of headers) {
            headerNames.push(h.innerText);
        }
        let headerNamesSorted = [...headerNames].sort((a, b) => a.localeCompare(b));

        // make sure the organisations are sorted by name alphabetically
        for (let i = 0; i < headerNames.length; i++) {
            cy.wrap(headerNames[i]).should("equal", headerNamesSorted[i]);
        }
        
        // make sure there are max 9 organisations on this page
        cy.wrap(headers).should("have.length.at.most", 9);
    });

    // look at card bodies
    cy.get('c-card-body').then((bodies) => {
        for (let b of bodies) {
            // check for existence of fields and make sure their content isnt empty
            // since some organisations have no registration number, we can only check for existence of the header
            cy.wrap(b).contains("Registrierungsnummer:");
            cy.wrap(b).contains("Name der Organisation:").parent().then((id) => {
                cy.wrap(id.get(0).innerText.replace("Name der Organisation:\n", "")).should("not.be.empty");
            });
            cy.wrap(b).contains("Adresse:").parent().then((id) => {
                cy.wrap(id.get(0).innerText.replace("Adresse:\n", "")).should("not.be.empty");
            });
        }
    });
});
  