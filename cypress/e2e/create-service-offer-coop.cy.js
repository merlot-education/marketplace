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
import { loginAsUser, fillGeneralOfferingFields, openOfferingDetails, checkGeneralOfferingFields, logout, deleteOffering } from "./create-service-offer-common.js";


beforeEach(() => {
    loginAsUser(testuserName, testuserOrga);
});

it('create coop contract service offering', {
    defaultCommandTimeout: 10000
  }, () => {

    // prepare some data to fill in the form
    let offeringName = "imc My Digital School - Transformation gemeinsam gestalten";
    let offeringDescription = "Die Kooperation My Digital School mit der imc ermöglicht Schulen technische und fachliche Unterstützung bei der Digitalisierung, sowie Unterstützung bei der Anbindung an den MERLOT Datenraum. Das erlaubt sicheres Teilen, Verarbeitung und Verwertung der Lerndaten Ihrer Schule durch MERLOT Partner, ohne Ihre Kontrolle über diese Daten aufgeben zu müssen.";
    let offeringCosts = "Verhandlungsbasis";
    let runtimeOptions = [1, 2, 0];
    let runtimeOptionsSelect = ["year(s)", "year(s)", "unlimited"];

    // click on navigation entry Serviceangebote,  the submenu is extended
    cy.contains('Service Angebote').click({force: true})

    // click on navigation entry Serviceangebot erstellen, the form will be displayed on the right side of the screen
    cy.contains('Service Angebot erstellen').click({force: true})
    cy.url().should('include', 'service-offerings/edit')

    // select Kooperationsvertrag as type
    cy.contains('Art des Service Angebots').next().should("not.be.empty").select("Kooperationsvertrag", {force: true});
    cy.contains('Datenaustauschanzahl-Option').should('not.exist');
    cy.contains('Nutzeranzahl-Option').should('not.exist');
    cy.contains('Laufzeit-Option');

    // make sure we cannot submit the form yet
    cy.contains("Änderungen speichern").should("be.disabled");

    // fill the form fields as specified above
    fillGeneralOfferingFields(offeringName, offeringDescription, null, null, offeringCosts, runtimeOptions, runtimeOptionsSelect);


    // make sure save button is no longer disabled
    // click on button "Änderungen speichern", the response that the offer is stored will be shown
    cy.contains("Änderungen speichern").should("not.be.disabled").click();
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", {timeout: 60000}).should("include.text", "urn:uuid:");
    cy.wait(500);
    cy.contains("Veröffentlichen").scrollIntoView().should("not.be.disabled",  {timeout: 30000}).click();
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", {timeout: 60000}).should("include.text", "urn:uuid:").then((result) => {

        // store id of created offering
        let offeringId = result.get(0).innerText.match(/urn:uuid:[^)]+/)[0];

        // click on navigation entry Angebote erkunden, the created offer is shown on top of the page
        cy.contains("Service Angebote erkunden").click({force: true});

        openOfferingDetails(offeringId, "Veröffentlicht");

        //double-check the saved values with the expected ones
        cy.contains("Details zum Service Angebot").parent().parent().within(() => {
            cy.contains("Angebotstyp").parent().should("include.text", "Kooperationsvertrag");
            cy.contains("Service ID").parent().should("include.text", offeringId);
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            checkGeneralOfferingFields(offeringName, offeringDescription, null, null, offeringCosts, runtimeOptions, runtimeOptionsSelect);
            
            cy.contains("Widerrufen").scrollIntoView().click({force: true});
            cy.contains("Status").parent().should("include.text", "Widerrufen");
            cy.contains("Veröffentlichen").scrollIntoView().click({force: true});
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            cy.contains("Widerrufen").scrollIntoView().click({force: true});
            cy.contains("Status").parent().should("include.text", "Widerrufen");
            cy.contains("Entwurf").scrollIntoView().click({force: true});
            cy.contains("Status").parent().should("include.text", "In Bearbeitung");
            cy.contains("Schließen").scrollIntoView().click({force: true});
        });

        cy.wait(500);

        logout();
        deleteOffering(offeringId);
    });
});