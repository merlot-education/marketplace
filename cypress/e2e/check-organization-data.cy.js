/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
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

import { testuserName, testuserOrga } from "./conclude-contract-common.js";
import { loginAsUser } from "./create-service-offer-common.js";

beforeEach(() => {
    cy.visit('/');
})

it('testuser can log in, check organization and assigned person data, edit organization data', {
    defaultCommandTimeout: 10000
  }, () => {
    
    loginAsUser(testuserName, testuserOrga)

    cy.contains("Meine Verträge");

    // make sure there is "Organisationsverwaltung" and click on it
    cy.contains('Organisationsverwaltung').click({force: true});
    // make sure there is "Organisationen erkunden" and click on it
    cy.contains('Organisationen erkunden').click({force: true});
    // url should have updated
    cy.url().should('include', 'organization/explore');

    // the organization of testuser, "Gaia-X AISBL", should be visible on page 1
    cy.get('c-card-header').filter(':contains("Gaia-X AISBL")').parent().within(() => {
        // this organization should be marked with "Aktiver Repräsentant"        
        cy.get('c-card-footer').should('have.text', "Aktiver Repräsentant");

        // the pool edcs ("edc1", "edc2") are connected and the corresponding S3 buckets belong to the organization ("merlot-edc-gaiax")
        cy.get('c-card-body').scrollIntoView().within(() => {
            cy.get('table > tbody > tr').then((rows) => {
                for (let row of rows) {
                    cy.wrap(row).contains(/^edc[1|2].+$/).next().should('have.text', 'merlot-edc-gaiax');
                }
            });

        });

    });

    cy.contains('Meine Organisation bearbeiten').click({force: true})

    let unique = Date.now().toString(36);
    let email = 'merlot-' + unique + '@gaiax.de';
    let agbLink = 'https://www.gaiax.com/de/agb/' + unique + '/';
    let hash = 'hash' + unique;

    let deleteString = '{selectall}{backspace}{selectall}{backspace}';

    // replace value of "Mail-Adresse*" with different one
    cy.contains("Mail-Adresse*").scrollIntoView().next().type(deleteString, { force: true }).type(email, { force: true });

    // replace value of field "Anbieter AGB - Link zum Inhalt*" with different one
    cy.contains("Link zum Inhalt*").scrollIntoView().next().type(deleteString, { force: true }).type(agbLink, { force: true });

    // replace value of field "Anbieter AGB - Hash des Dokuments*" with different one
    cy.contains("Hash des Dokuments*").scrollIntoView().next().type(deleteString, { force: true }).type(hash, { force: true });

    // click on Änderungen speichern, the page shows the following response "Selbstbeschreibung erfolgreich gespeichert! ID: Participant:40"
    cy.contains('Änderungen speichern').should("not.be.disabled").click();
    cy.contains("Selbstbeschreibung erfolgreich gespeichert! (ID: did:web:marketplace.dev.merlot-education.eu:participant:c041ea73-3ecf-3a06-a5cd-919f5cef8e54)", { timeout: 30000 });

    // logout again, after this the welcome text should be for a visitor again
    cy.get("#logout-button").click();
    cy.get("#welcome-text").contains('Willkommen, Besucher!');

    // click on button register, the registration page is visible
    cy.get("#register-button").click();
    // url should have updated
    cy.url().should('include', 'registration');

    // check the mail address of the receiver via the mailTo link, it should contain the mail as saved above 
    const recipient = 'funktionspostfach@merlot.de';
    const cc = email; //mail address that was used above
    const subject = 'Registrierung im MERLOT Portal für Organisationen';
    const body = 'Bitte füllen Sie das im Knowledge Transfer Center heruntergeladene Formular aus und hängen es dieser Mail an.';

    const mailtoURL = `mailto:${recipient}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    cy.window().then(win => {
        cy.stub(win, 'alert').as('Alert');
    });

    cy.on('window:before:load', (win) => {
        cy.stub(win, 'open').as('Open');
    });

    //select "Gaia-X AISBL" as federator and click on button "Föderator bestätigen und Mailprogramm öffnen"
    cy.contains("Gaia-X AISBL").parent().within(() => { cy.get('input').click() });
    cy.contains("Föderator bestätigen und Mailprogramm öffnen").click();

    cy.get('@Open').should('have.been.calledOnceWithExactly', mailtoURL, '_blank');
    cy.get("@Alert").should("have.been.calledOnceWithExactly", "Es konnte kein Mailprogramm geöffnet werden.");
});