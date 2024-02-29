export function loginAsUser(username: string, password: string, name: string, organization: string) {
    cy.visit('/')

    //open merlot marketplace landing page, user is not logged in, use the welcome text to check that user is a visitor
    cy.get("#welcome-text").contains('Willkommen, Besucher!');

    // click login will redirect to keycloak, use testuser to login
    cy.get("#login-button").click();

    cy.get("#username").type(username);
    cy.get("#password").type(password);
    cy.get("#kc-login").click();

    // make sure welcome text changed
    cy.get("#welcome-text").contains('Willkommen, ' + name + '!');
    cy.get("#role-select").should("contain.text", organization);
    cy.contains("Meine Verträge"); // todo maybe find a better way to make sure the navbar is loaded
}

export function logout() {
    cy.get("#logout-button").click();
    //open merlot marketplace landing page, user is not logged in, use the welcome text to check that user is a visitor
    cy.get("#welcome-text").contains('Willkommen, Besucher!');
}

export function fillGeneralOfferingFields(offeringName: string, offeringDescription: string, 
    offeringTncLink: string, offeringTncHash: string, 
    offeringCosts: string, runtimeOptions: number[], 
    runtimeOptionsSelect: string[]) {
    cy.contains("Servicename").next().type(offeringName, {force: true});
    cy.contains("Service Bereitsteller").siblings("input").should('not.have.value', '');
    cy.contains("Service Anbieter").siblings("input").should('not.have.value', '');
    cy.contains("Service Bereitsteller").siblings("input").should('be.disabled');
    cy.contains("Service Anbieter").siblings("input").should('be.disabled');
    if (offeringDescription) {
        cy.contains("Detaillierte Beschreibung des Services").scrollIntoView().next().type(offeringDescription, {force: true});
    }
    if (offeringTncLink && offeringTncHash) {
        cy.contains("Merlot AGB").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
            cy.get("button").click({force: true});
        });
        cy.contains("Anbieter AGB");
        cy.contains("Serviceangebotspezifische Geschäftsbedingungen").scrollIntoView().click({force: true}).parent().parent().parent().parent().parent().within(() => {
            cy.contains("Link zum Inhalt").next().type(offeringTncLink, {force: true});
            cy.contains("Hash des Dokuments").next().type(offeringTncHash, {force: true});
        });
    }
    if (offeringCosts) {
        cy.contains("Beispielkosten").next().type(offeringCosts, {force: true});
    }
    
    cy.contains("Laufzeit-Option").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        for (let i = 1; i < runtimeOptions.length; i++) {
            cy.get("button").click({force: true});
        }
    });
    cy.get('mat-expansion-panel-header:visible:contains("Laufzeit-Option")').should("have.length", runtimeOptions.length).each(($el, index, $list) => {
        if (index !== 0) {
            cy.wrap($el).click({force: true});
        } 
        cy.wrap($el).parent().parent().parent().contains("Anzahl-Teil der Laufzeit").next().type(runtimeOptions[index] + "", {force: true});
        cy.wrap($el).parent().parent().parent().contains("Maß-Teil der Laufzeit").next().select(runtimeOptionsSelect[index]);
    });
    cy.contains("Erstelldatum").next().invoke('val').should("not.be.empty");
    cy.contains("Merlot AGB akzeptieren").parent().within(() => {
        cy.get("input").check();
    });
}

export function checkGeneralOfferingFields(offeringName: string, offeringDescription: string, 
    offeringTncLink: string, offeringTncHash: string, 
    offeringCosts: string, runtimeOptions: number[], 
    runtimeOptionsSelect: string[]) {
    cy.contains("Name").parent().should("include.text", offeringName);
    cy.contains("Erstelldatum");
    cy.contains("Anbieter");
    if (offeringDescription) {
        cy.contains("Beschreibung").parent().should("include.text", offeringDescription);
    }
    cy.contains("Letzte Änderung");
    if (offeringCosts) {
        cy.contains("Beispielkosten").parent().should("include.text", offeringCosts);
    }
    
    if (offeringTncLink && offeringTncHash) {
        cy.contains("Serviceangebotspezifische Geschäftsbedingungen").parent().should("include.text", offeringTncLink).should("include.text", offeringTncHash);
    }

    for (let runtimeOptIdx = 0; runtimeOptIdx < runtimeOptions.length; runtimeOptIdx++) {
        if (runtimeOptions[runtimeOptIdx] !== 0 && runtimeOptionsSelect[runtimeOptIdx] !== "unlimited") {
            cy.contains("Laufzeitoptionen").parent().should("include.text", runtimeOptions[runtimeOptIdx] + " " + runtimeOptionsSelect[runtimeOptIdx]);
        } else {
            cy.contains("Laufzeitoptionen").parent().should("include.text", "Unbegrenzt");
        }
    }
}

export function deleteOffering(offeringId: string) {
    // assumes contract is in draft or revoked state
    loginAsUser("testuser", "testuser", "Test User", "Gaia-X")

    // click on navigation entry Serviceangebote,  the submenu is extended
    cy.contains('Service Angebote').click()

    // click on navigation entry Serviceangebot erkunden, the form will be displayed on the right side of the screen
    cy.contains('Service Angebote erkunden').click()
    cy.url().should('include', 'service-offerings/explore')

    // search for offering in list
    cy.contains(offeringId).parent().parent().parent().within(() => {
        // click on the card button "Details" to open the detail page
        cy.contains("Details").click({force: true});
    });

    cy.contains("Details zum Service Angebot").parent().parent().within(() => {
        cy.contains("Löschen").scrollIntoView().click({force: true});
    });

    // delete the offering
    cy.contains("Details zum Service Angebot").parent().parent().within(() => {
        cy.contains("Status").parent().should("include.text", "Gelöscht");
        cy.contains("Endgültig löschen").scrollIntoView().click({force: true});
    });

    // make sure the offering is no longer in the list
    cy.get("c-card-body").contains(offeringId).should("not.exist");
}

export function openOfferingForEdit(offeringId: string) {
    // search for offering in list
    cy.contains(offeringId).parent().parent().parent().within(() => {
        //check status of created offer equals "In Bearbeitung"
        cy.contains("Status").parent().should("include.text", "In Bearbeitung");
        // click on button Bearbeiten of the created offer
        cy.contains("Bearbeiten").click({force: true});
    });
}

export function openOfferingDetails(offeringId: string, expectedStatus: string) {
    // search for offering in list
    cy.contains(offeringId).parent().parent().parent().within(() => {
        if (expectedStatus) {
            // check status of published offer equals expected status
            cy.contains("Status").parent().should("include.text", expectedStatus);
        }
        // click on button Bearbeiten of the created offer
        cy.contains("Details").click({force: true});
    });
}

export function archiveReleasedOffering(offeringId: string) {
    // assumes contract is released state

    // click on navigation entry Serviceangebote,  the submenu is extended
    cy.contains('Service Angebote').click()

    // click on navigation entry Serviceangebot erkunden, the form will be displayed on the right side of the screen
    cy.contains('Service Angebote erkunden').click()
    cy.url().should('include', 'service-offerings/explore')

    // search for offering in list
    cy.contains(offeringId).parent().parent().parent().within(() => {
        // click on the card button "Details" to open the detail page
        cy.contains("Details").click({force: true});
    });

    cy.contains("Details zum Service Angebot").parent().parent().within(() => {
        cy.contains("Widerrufen").scrollIntoView().click({force: true});
    });

    // delete the offering
    cy.contains("Details zum Service Angebot").parent().parent().within(() => {
        cy.contains("Status").parent().should("include.text", "Widerrufen");
    });

    cy.contains("Löschen").click({force: true});

    cy.contains("Details zum Service Angebot").parent().parent().within(() => {
        cy.contains("Status").parent().should("include.text", "Archiviert");
    });

    cy.contains("Schließen").click({force: true});
}

export function checkOfferingInOverview(offeringId: string, expectedStatus: string) {
    // search for offering in list
    cy.contains(offeringId).parent().parent().parent().within(() => {
        if (expectedStatus) {
            // check status of published offer equals expected status
            cy.contains("Status").parent().should("include.text", expectedStatus);
        }
    });
}

export function createAndReleaseDataDeliveryOffering(offeringName: string, offeringDescription: string, offeringCosts: string, dataTransfertype: string, dataExchangeOptions: number[], runtimeOptions: number[], runtimeOptionsSelect: string[], offeringTncLink: string, offeringTncHash: string) {
    let dataAccessType = "Download";
    
    // click on navigation entry Serviceangebote,  the submenu is extended
    cy.contains('Service Angebote').click({ force: true });

    // click on navigation entry Serviceangebot erstellen, the form will be displayed on the right side of the screen
    cy.contains('Service Angebot erstellen').click({ force: true })
    cy.url().should('include', 'service-offerings/edit');

    // select Datenlieferung as type
    cy.contains('Art des Service Angebots').next().should("not.be.empty").select("Datenlieferung", { force: true });
    cy.contains('Datenaustauschanzahl-Option');
    cy.contains('Nutzeranzahl-Option').should('not.exist');
    cy.contains('Laufzeit-Option');

    // make sure we cannot publish the offering yet
    cy.contains("Veröffentlichen").should("be.disabled");

    // fill the form fields as specified above
    fillGeneralOfferingFields(offeringName, offeringDescription, offeringTncLink, offeringTncHash, offeringCosts, runtimeOptions, runtimeOptionsSelect);
    cy.contains("Datentransferart").next().select(dataTransfertype, { force: true });
    cy.contains("Datenzugriffsart").next().select(dataAccessType, { force: true });
    cy.contains("Datenaustauschanzahl-Option").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        cy.get("button").click({ force: true }).click({ force: true }).click({ force: true });
    });
    cy.get('mat-expansion-panel-header:visible:contains("Datenaustauschanzahl-Option")').should("have.length", dataExchangeOptions.length).each(($el, index, $list) => {
        if (index !== 0) {
            cy.wrap($el).click({ force: true });
        }
        cy.wrap($el).parent().parent().parent().contains("Option für maximale Anzahl an Datenaustauschen").next().type(dataExchangeOptions[index] + "", { force: true });
    });

    // make sure publish button is not disabled
    // click on button "Veröffentlichen"
    cy.contains("Veröffentlichen").should("not.be.disabled").scrollIntoView().click({ force: true });
}

export function createAndReleaseSaaSOffering(offeringName: string, offeringDescription: string, offeringTncLink: string, offeringTncHash: string, offeringCosts: string, offeringHWRequirements: string, userCountOptions: number[], runtimeOptions: number[], runtimeOptionsSelect: string[]){
    // click on navigation entry Serviceangebote, the submenu is extended
    cy.contains('Service Angebote').click({ force: true });

    // click on navigation entry Serviceangebot erstellen, the form will be displayed on the right side of the screen
    cy.contains('Service Angebot erstellen').click({ force: true });

    // select Webanwendung as type
    cy.contains('Art des Service Angebots').next().should("not.be.empty").select("Webanwendung", { force: true });

    // fill the form fields as specified above
    fillGeneralOfferingFields(offeringName, offeringDescription, offeringTncLink, offeringTncHash, offeringCosts, runtimeOptions, runtimeOptionsSelect);
    cy.contains("Anforderungen an die Hardware").next().type(offeringHWRequirements, { force: true });
    cy.contains("Nutzeranzahl-Option").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        cy.get("button").click({ force: true }).click({ force: true }).click({ force: true });
    });
    cy.get('mat-expansion-panel-header:visible:contains("Nutzeranzahl-Option")').should("have.length", userCountOptions.length).each(($el, index, $list) => {
        if (index !== 0) {
            cy.wrap($el).click({ force: true });
        }
        cy.wrap($el).parent().parent().parent().contains("Option für maximale Nutzerzahl").next().type(userCountOptions[index] + "", { force: true });
    });

    // make sure publish button is not disabled
    // click on button "Veröffentlichen"
    cy.contains("Veröffentlichen").should("not.be.disabled").scrollIntoView().click({ force: true });
}