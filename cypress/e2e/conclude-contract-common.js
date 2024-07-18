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

export let inDraft = "In Bearbeitung";
export let consumerSigned = "Vom Kunden unterschrieben";
export let released = "Veröffentlicht";
export let revoked = "Widerrufen";
export let testuserName = "Test User";
export let testuser2Name = "Test User2";
export let testuserOrga = "Gaia-X";
export let testuser2Orga = "Dataport";

export function openContractForEdit(contractIdWithoutPrefix, status, offeringName) {
    // search for contract in list
    cy.contains("ID: " + contractIdWithoutPrefix).parent().parent().within(() => {
        // check status of created contract equals the given status
        cy.contains("Status").parent().should("include.text", status);
        // check associated service of created contract
        cy.contains("Servicename").parent().should("include.text", offeringName);
        // click on button Bearbeiten of the created contract
        cy.contains("Bearbeiten").click({force: true});
    });
}

export function openContractDetails(contractIdWithoutPrefix, status, offeringName) {
    // search for contract in list
    cy.contains("ID: " + contractIdWithoutPrefix).parent().parent().within(() => {
        // check status of created contract equals the given status
        cy.contains("Status").parent().should("include.text", status);
        // check associated service of created contract
        cy.contains("Servicename").parent().should("include.text", offeringName);
        // click on button Bearbeiten of the created contract
        cy.contains("Details").click({force: true});
    });
}

export function checkContractInOverview(contractIdWithoutPrefix, status, offeringName){
    cy.contains("ID: " + contractIdWithoutPrefix).parent().parent().within(() => {
        // check status of created contract equals the given status
        cy.contains("Status").parent().should("include.text", status);
        // check associated service of created contract
        cy.contains("Servicename").parent().should("include.text", offeringName);
    });
}