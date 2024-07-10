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

import { testuserName, testuserOrga } from "./conclude-contract-common.js";
import { loginAsUser, fillGeneralOfferingFields, openOfferingForEdit, openOfferingDetails, checkGeneralOfferingFields, logout, deleteOffering } from "./create-service-offer-common.js";

beforeEach(() => {
    loginAsUser(testuserName, testuserOrga);
});

it('create data delivery service offering', {
    defaultCommandTimeout: 10000
  }, () => {
    // prepare some data to fill in the form
    let offeringName = "Brandneue Jobangebote";
    let offeringDescription = "Ob Praktika, Ausbildungen, Werkstudentenjobs oder Festanstellungen... Wir schicken Ihnen immer die neusten Stellenanzeigen bei ChemPoint für Ihre Plattform, um Ihren Nutzern offene Jobangebote mit tollen Perspektiven und Entwicklungsmöglichkeiten in der chemischen Industrie zu bieten und ein “perfect Match” zu finden. Lösungen sind unser Job!";
    let offeringCosts = "5€ pro Stellenanzeige, 10€ Prämie pro Match";
    let dataTransfertype = "Push";
    let dataAccessType = "Download";
    let dataExchangeOptions = [2, 4, 12, 0];
    let runtimeOptions = [1, 2, 0];
    let runtimeOptionsSelect = ["year(s)", "year(s)", "unlimited"];

    // click on navigation entry Serviceangebote,  the submenu is extended
    cy.contains('Service Angebote').click({force: true})

    // click on navigation entry Serviceangebot erstellen, the form will be displayed on the right side of the screen
    cy.contains('Service Angebot erstellen').click({force: true})
    cy.url().should('include', 'service-offerings/edit')

    // select Datenlieferung as type
    cy.contains('Art des Service Angebots').next().should("not.be.empty").select("Datenlieferung", {force: true});
    cy.contains('Datenaustauschanzahl-Option');
    cy.contains('Nutzeranzahl-Option').should('not.exist');
    cy.contains('Laufzeit-Option');

    // make sure we cannot submit the form yet
    cy.contains("Änderungen speichern").should("be.disabled");

    // fill the form fields as specified above
    fillGeneralOfferingFields(offeringName, offeringDescription, null, null, offeringCosts, runtimeOptions, runtimeOptionsSelect);
    cy.contains("Datentransferart").next().select(dataTransfertype, {force: true});
    cy.contains("Datenzugriffsart").next().select(dataAccessType, {force: true});
    cy.contains("Datenaustauschanzahl-Option").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        cy.get("button").click({force: true}).click({force: true}).click({force: true});
    });
    cy.get('mat-expansion-panel-header:visible:contains("Datenaustauschanzahl-Option")').should("have.length", dataExchangeOptions.length).each(($el, index, $list) => {
        if (index !== 0) {
            cy.wrap($el).click({force: true});
        } 
        cy.wrap($el).parent().parent().parent().contains("Option für maximale Anzahl an Datenaustauschen").next().type(dataExchangeOptions[index] + "", {force: true});
    });
    

    // make sure save button is no longer disabled
    // click on button "Änderungen speichern", the response that the offer is stored will be shown
    cy.contains("Änderungen speichern").should("not.be.disabled").click();
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", {timeout: 60000}).should("include.text", "urn:uuid:").then((result) => {

        // store id of created offering
        let offeringId = result.get(0).innerText.match(/urn:uuid:[^)]+/)[0];

        // click on navigation entry Angebote erkunden, the created offer is shown on top of the page
        cy.contains("Service Angebote erkunden").click();

        openOfferingForEdit(offeringId);

        // a popup opens with the form to modify offer (here data could be checked with entered ones)
        cy.contains("Service Angebot \"" + offeringId + "\" bearbeiten").parent().parent().within(() => {
            //change field Servicename* to Holen Sie sich aktuelle Jobangebote 
            offeringName = "Holen Sie sich aktuelle Jobangebote";
            cy.contains("Servicename").next().clear({force: true});
            cy.contains("Servicename").next().type(offeringName, {force: true});

            dataTransfertype = "Pull";
            cy.contains("Datentransferart").next().select(dataTransfertype, {force: true});

            // scroll down and click on button "Publish", the respones that the offer is published will be shown
            cy.contains("Veröffentlichen").scrollIntoView().click({force: true});
            cy.contains("Selbstbeschreibung erfolgreich gespeichert!", {timeout: 60000});
        });

        cy.contains("Service Angebote erkunden").click();

        // activate filter, select Veröffentlicht, the offer should be the first entry of the list of published offers
        cy.contains("Zeige nur Angebote mit Status").parent().next().next().select("Veröffentlicht", {force: true});
        cy.contains("Zeige nur Angebote mit Status").prev().click({force: true});

        openOfferingDetails(offeringId, "Veröffentlicht");

        //double-check the saved values with the expected ones
        cy.contains("Details zum Service Angebot").parent().parent().within(() => {
            cy.contains("Angebotstyp").parent().should("include.text", "Datenlieferung");
            cy.contains("Service ID").parent().should("include.text", offeringId);
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            checkGeneralOfferingFields(offeringName, offeringDescription, null, null, offeringCosts, runtimeOptions, runtimeOptionsSelect);
            cy.contains("Datentransferart").parent().should("include.text", dataTransfertype);
            cy.contains("Datenzugriffsart").parent().should("include.text", dataAccessType);
            for (let dataOpt of dataExchangeOptions) {
                if (dataOpt !== 0) {
                    cy.contains("Optionen für Anzahl erlaubter Datenaustausche").parent().should("include.text", dataOpt);
                } else {
                    cy.contains("Optionen für Anzahl erlaubter Datenaustausche").parent().should("include.text", "Unbegrenzt");
                }
            }
            for (let runtimeOptIdx = 0; runtimeOptIdx < runtimeOptions.length; runtimeOptIdx++) {
                if (runtimeOptions[runtimeOptIdx] !== 0 && runtimeOptionsSelect[runtimeOptIdx] !== "unlimited") {
                    cy.contains("Laufzeitoptionen").parent().should("include.text", runtimeOptions[runtimeOptIdx] + " " + runtimeOptionsSelect[runtimeOptIdx]);
                } else {
                    cy.contains("Laufzeitoptionen").parent().should("include.text", "Unbegrenzt");
                }
            }
            
            cy.contains("Schließen").scrollIntoView().click({force: true});;
        });

        // click on logout, the user is redirected to the MPO landingpage, use the welcome text to check that user is a visitor
        logout();

        // click on navigation entry Serviceangebote,  the submenu is extended
        cy.contains('Service Angebote').click({force: true})

        // click on navigation entry Serviceangebot erkunden, the form will be displayed on the right side of the screen
        cy.contains('Service Angebote erkunden').click({force: true})
        cy.url().should('include', 'service-offerings/explore')

        // search for offering in list
        cy.contains(offeringId).parent().parent().parent().parent().parent().within(() => {
            // make sure type and name is right
            cy.contains("Datenlieferung");
            cy.contains(offeringName);

            // check for existence of fields
            cy.contains("Erstelldatum");
            cy.contains("Anbieter");

            // visitors have no details button
        });

        // log back in as testuser
        loginAsUser(testuserName, testuserOrga);

        // click on navigation entry Serviceangebote,  the submenu is extended
        cy.contains('Service Angebote').click({force: true})

        // click on navigation entry Serviceangebot erkunden, the form will be displayed on the right side of the screen
        cy.contains('Service Angebote erkunden').click({force: true})
        cy.url().should('include', 'service-offerings/explore')

        openOfferingDetails(offeringId, "Veröffentlicht");

        // revoke the offering
        cy.contains("Details zum Service Angebot").parent().parent().within(() => {
            cy.contains("Angebot neu erstellen");
            cy.contains("Widerrufen").scrollIntoView().click({force: true});
            cy.contains("Status").parent().should("include.text", "Widerrufen");
            cy.contains("Schließen").scrollIntoView().click({force: true});
        });

        logout();

        deleteOffering(offeringId);
    });
});