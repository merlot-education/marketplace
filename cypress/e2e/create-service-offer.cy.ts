function loginAsTestuser() {
    // click login will redirect to keycloak, use testuser to login
    cy.get("#login-button").click();

    cy.get("#username").type("testuser");
    cy.get("#password").type("testuser");
    cy.get("#kc-login").click();

    // make sure welcome text changed
    cy.get("#welcome-text").contains('Willkommen, Test User!');
}

function logout() {
    cy.get("#logout-button").click();
    //open merlot marketplace landing page, user is not logged in, use the welcome text to check that user is a visitor
    cy.get("#welcome-text").contains('Willkommen, Besucher!');
}

function fillGeneralOfferingFields(offeringName: string, offeringDescription: string, 
    offeringTncLink: string, offeringTncHash: string, 
    offeringCosts: string, runtimeOptions: number[], 
    runtimeOptionsSelect: string[]) {
    cy.contains("Servicename").next().type(offeringName, {force: true});
    cy.contains("Service Bereitsteller").next().invoke('val').should("not.be.empty");
    cy.contains("Service Anbieter").next().invoke('val').should("not.be.empty");
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

function checkGeneralOfferingFields(offeringName: string, offeringDescription: string, 
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

function deleteOffering(offeringId: string) {
    // assumes contract is in draft or revoked state
    loginAsTestuser()

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


beforeEach(() => {
    cy.visit('/')

    //open merlot marketplace landing page, user is not logged in, use the welcome text to check that user is a visitor
    cy.get("#welcome-text").contains('Willkommen, Besucher!');

    // click login will redirect to keycloak, use testuser to login
    cy.get("#login-button").click();

    cy.get("#username").type("testuser");
    cy.get("#password").type("testuser");
    cy.get("#kc-login").click();

    // make sure welcome text changed
    cy.get("#welcome-text").contains('Willkommen, Test User!');
});

it('create saas service offering', () => {

    // prepare some data to fill in the form
    let offeringName = "DRAFT: Lernplattform (LMS) für betriebliche Weiterbildung (SaaS)";
    let offeringDescription = "Bewältigen Sie Ihre Enterprise Anforderungen mit der perfekten Kombination aus Learning Management System und Learning Experience Platform. Nutzen Sie Daten über sich ändernde Skill- und Kompetenzanforderungen und den Fachkräftemarkt Ihrer Branche, um Ihre Weiterbildungsprozesse automatisch anzupassen. Dazu ermöglicht das LMS der imc AG als SaaS eine besonders einfache Anbindung an den MERLOT Datenraum, der sichere Verarbeitung und Verwertung von Ihren Daten garantiert und in dem Sie in Kontrolle Ihrer Daten bleiben.";
    let offeringTncLink = "https://merlot.imc-learning.de/ilp/pages/external-dashboard.jsf?menuId=1501#/?dashboardId=1002"
    let offeringTncHash = "hash15011002";
    let offeringCosts = "Abonnement, Verhandlungsbasis";
    let offeringHWRequirements = "Software as a Service";
    let userCountOptions = [100, 500, 1000, 0];
    let runtimeOptions = [1, 2, 0];
    let runtimeOptionsSelect = ["year(s)", "year(s)", "unlimited"];

    // click on navigation entry Serviceangebote,  the submenu is extended
    cy.contains('Service Angebote').click()

    // click on navigation entry Serviceangebot erstellen, the form will be displayed on the right side of the screen
    cy.contains('Service Angebot erstellen').click()
    cy.url().should('include', 'service-offerings/edit')

    // select Webanwendung as type
    cy.contains('Art des Service Angebots').next().should("not.be.empty").select("Webanwendung");
    cy.contains("Füllen Sie das MerlotServiceOfferingSaaS Formular aus");

    // make sure we cannot submit the form yet
    cy.contains("Änderungen speichern").should("be.disabled");

    // fill the form fields as specified above
    fillGeneralOfferingFields(offeringName, offeringDescription, offeringTncLink, offeringTncHash, offeringCosts, runtimeOptions, runtimeOptionsSelect);
    cy.contains("Anforderungen an die Hardware").next().type(offeringHWRequirements, {force: true});
    cy.contains("Nutzeranzahl-Option").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        cy.get("button").click({force: true}).click({force: true}).click({force: true});
    });
    cy.get('mat-expansion-panel-header:visible:contains("Nutzeranzahl-Option")').should("have.length", userCountOptions.length).each(($el, index, $list) => {
        if (index !== 0) {
            cy.wrap($el).click({force: true});
        } 
        cy.wrap($el).parent().parent().parent().contains("Option für maximale Nutzerzahl").next().type(userCountOptions[index] + "", {force: true});
    });

    // make sure save button is no longer disabled
    // click on button "Änderungen speichern", the response that the offer is stored will be shown
    cy.contains("Änderungen speichern").should("not.be.disabled").click();
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", {timeout: 30000}).should("include.text", "ServiceOffering:").then((result) => {

        // store id of created offering
        let offeringId = result.get(0).innerText.match(/ServiceOffering:\S+/)[0];

        // click on navigation entry Angebote erkunden, the created offer is shown on top of the page
        cy.contains("Service Angebote erkunden").click();

        // search for offering in list
        cy.contains(offeringId).parent().parent().parent().within(() => {
            //check status of created offer equals "In Bearbeitung"
            cy.contains("Status").parent().should("include.text", "In Bearbeitung");
            // click on button Bearbeiten of the created offer
            cy.contains("Bearbeiten").click({force: true});
        });

        // a popup opens with the form to modify offer (here data could be checked with entered ones)
        cy.contains("Service Angebot \"" + offeringName + "\" bearbeiten").parent().parent().within(() => {
            //change field Servicename* to Lernplattform (LMS) für betriebliche Weiterbildung (SaaS) 
            offeringName = "Lernplattform (LMS) für betriebliche Weiterbildung (SaaS)";
            cy.contains("Servicename").next().clear({force: true});
            cy.contains("Servicename").next().type(offeringName, {force: true});

            // scroll down and click on button "Publish", the respones that the offer is published will be shown
            cy.contains("Veröffentlichen").scrollIntoView().click({force: true});
            cy.contains("Selbstbeschreibung erfolgreich gespeichert!");
            cy.contains("Schließen").click();
        });

        cy.wait(500);

        // activate filter, select Veröffentlicht, the offer should be the first entry of the list of published offers
        cy.contains("Zeige nur Angebote mit Status").parent().next().next().select("Veröffentlicht", {force: true});
        cy.contains("Zeige nur Angebote mit Status").prev().click({force: true});

        // search for offering in list
        cy.contains(offeringId).parent().parent().parent().within(() => {
            // check status of published offer equals "Veröffentlicht"
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            // click on the card button "Details" to open the detail page
            cy.contains("Details").click({force: true});
        });

        //double-check the saved values with the expected ones
        cy.contains("Details zum Service Angebot").should("be.visible", {timeout: 10000}).parent().parent().within(() => {
            cy.contains("Angebotstyp").parent().should("include.text", "Webanwendung");
            cy.contains("Service ID").parent().should("include.text", offeringId);
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            checkGeneralOfferingFields(offeringName, offeringDescription, offeringTncLink, offeringTncHash, offeringCosts, runtimeOptions, runtimeOptionsSelect);
            cy.contains("Hardware-Anforderungen").parent().should("include.text", offeringHWRequirements);
            for (let userOpt of userCountOptions) {
                if (userOpt !== 0) {
                    cy.contains("Optionen für Anzahl erlaubter Benutzer").parent().should("include.text", userOpt);
                } else {
                    cy.contains("Optionen für Anzahl erlaubter Benutzer").parent().should("include.text", "Unbegrenzt");
                }
            }
            
            cy.contains("Schließen").scrollIntoView().click({force: true});;
        });

        // click on logout, the user is redirected to the MPO landingpage, use the welcome text to check that user is a visitor
        logout();

        // click on navigation entry Serviceangebote,  the submenu is extended
        cy.contains('Service Angebote').click()

        // click on navigation entry Serviceangebot erkunden, the form will be displayed on the right side of the screen
        cy.contains('Service Angebote erkunden').click()
        cy.url().should('include', 'service-offerings/explore')

        // search for offering in list
        cy.contains(offeringId).parent().parent().parent().parent().parent().within(() => {
            // make sure type and name is right
            cy.contains("Webanwendung");
            cy.contains(offeringName);

            // check for existence of fields
            cy.contains("Erstelldatum");
            cy.contains("Anbieter");

            // visitors have no details button
        });

        // log back in as testuser
        // click login will redirect to keycloak, use testuser to login
        loginAsTestuser();

        // click on navigation entry Serviceangebote,  the submenu is extended
        cy.contains('Service Angebote').click()

        // click on navigation entry Serviceangebot erkunden, the form will be displayed on the right side of the screen
        cy.contains('Service Angebote erkunden').click()
        cy.url().should('include', 'service-offerings/explore')

        // search for offering in list
        cy.contains(offeringId).parent().parent().parent().within(() => {
            // check status of published offer equals "Veröffentlicht"
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            // click on the card button "Details" to open the detail page
            cy.contains("Details").click({force: true});
        });

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

it('create data delivery service offering', () => {
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
    cy.contains('Service Angebote').click()

    // click on navigation entry Serviceangebot erstellen, the form will be displayed on the right side of the screen
    cy.contains('Service Angebot erstellen').click()
    cy.url().should('include', 'service-offerings/edit')

    // select Webanwendung as type
    cy.contains('Art des Service Angebots').next().should("not.be.empty").select("Datenlieferung");
    cy.contains("Füllen Sie das MerlotServiceOfferingDataDelivery Formular aus");

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
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", {timeout: 30000}).should("include.text", "ServiceOffering:").then((result) => {

        // store id of created offering
        let offeringId = result.get(0).innerText.match(/ServiceOffering:\S+/)[0];

        // click on navigation entry Angebote erkunden, the created offer is shown on top of the page
        cy.contains("Service Angebote erkunden").click();

        // search for offering in list
        cy.contains(offeringId).parent().parent().parent().within(() => {
            //check status of created offer equals "In Bearbeitung"
            cy.contains("Status").parent().should("include.text", "In Bearbeitung");
            // click on button Bearbeiten of the created offer
            cy.contains("Bearbeiten").click({force: true});
        });

        // a popup opens with the form to modify offer (here data could be checked with entered ones)
        cy.contains("Service Angebot \"" + offeringName + "\" bearbeiten").parent().parent().within(() => {
            //change field Servicename* to Holen Sie sich aktuelle Jobangebote 
            offeringName = "Holen Sie sich aktuelle Jobangebote";
            cy.contains("Servicename").next().clear({force: true});
            cy.contains("Servicename").next().type(offeringName, {force: true});

            dataTransfertype = "Pull";
            cy.contains("Datentransferart").next().select(dataTransfertype, {force: true});

            // scroll down and click on button "Publish", the respones that the offer is published will be shown
            cy.contains("Veröffentlichen").scrollIntoView().click({force: true});
            cy.contains("Selbstbeschreibung erfolgreich gespeichert!");
            cy.contains("Schließen").click();
        });

        // activate filter, select Veröffentlicht, the offer should be the first entry of the list of published offers
        cy.contains("Zeige nur Angebote mit Status").parent().next().next().select("Veröffentlicht", {force: true});
        cy.contains("Zeige nur Angebote mit Status").prev().click({force: true});

        // search for offering in list
        cy.contains(offeringId).parent().parent().parent().within(() => {
            // check status of published offer equals "Veröffentlicht"
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            // click on the card button "Details" to open the detail page
            cy.contains("Details").click({force: true});
        });

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
        cy.contains('Service Angebote').click()

        // click on navigation entry Serviceangebot erkunden, the form will be displayed on the right side of the screen
        cy.contains('Service Angebote erkunden').click()
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
        loginAsTestuser();

        // click on navigation entry Serviceangebote,  the submenu is extended
        cy.contains('Service Angebote').click()

        // click on navigation entry Serviceangebot erkunden, the form will be displayed on the right side of the screen
        cy.contains('Service Angebote erkunden').click()
        cy.url().should('include', 'service-offerings/explore')

        // search for offering in list
        cy.contains(offeringId).parent().parent().parent().within(() => {
            // check status of published offer equals "Veröffentlicht"
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            // click on the card button "Details" to open the detail page
            cy.contains("Details").click({force: true});
        });

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

it('create coop contract service offering', () => {

    // prepare some data to fill in the form
    let offeringName = "imc My Digital School - Transformation gemeinsam gestalten";
    let offeringDescription = "Die Kooperation My Digital School mit der imc ermöglicht Schulen technische und fachliche Unterstützung bei der Digitalisierung, sowie Unterstützung bei der Anbindung an den MERLOT Datenraum. Das erlaubt sicheres Teilen, Verarbeitung und Verwertung der Lerndaten Ihrer Schule durch MERLOT Partner, ohne Ihre Kontrolle über diese Daten aufgeben zu müssen.";
    let offeringCosts = "Verhandlungsbasis";
    let runtimeOptions = [1, 2, 0];
    let runtimeOptionsSelect = ["year(s)", "year(s)", "unlimited"];

    // click on navigation entry Serviceangebote,  the submenu is extended
    cy.contains('Service Angebote').click()

    // click on navigation entry Serviceangebot erstellen, the form will be displayed on the right side of the screen
    cy.contains('Service Angebot erstellen').click()
    cy.url().should('include', 'service-offerings/edit')

    // select Webanwendung as type
    cy.contains('Art des Service Angebots').next().should("not.be.empty").select("Kooperationsvertrag");
    cy.contains("Füllen Sie das MerlotServiceOfferingCooperation Formular aus");

    // make sure we cannot submit the form yet
    cy.contains("Änderungen speichern").should("be.disabled");

    // fill the form fields as specified above
    fillGeneralOfferingFields(offeringName, offeringDescription, null, null, offeringCosts, runtimeOptions, runtimeOptionsSelect);


    // make sure save button is no longer disabled
    // click on button "Änderungen speichern", the response that the offer is stored will be shown
    cy.contains("Änderungen speichern").should("not.be.disabled").click();
    cy.contains("Veröffentlichen").should("not.be.disabled",  {timeout: 30000}).click();
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", {timeout: 30000}).should("include.text", "ServiceOffering:").then((result) => {

        // store id of created offering
        let offeringId = result.get(0).innerText.match(/ServiceOffering:\S+/)[0];

        // click on navigation entry Angebote erkunden, the created offer is shown on top of the page
        cy.contains("Service Angebote erkunden").click();

        // search for offering in list
        cy.contains(offeringId).parent().parent().parent().within(() => {
            // check status of published offer equals "Veröffentlicht"
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            // click on the card button "Details" to open the detail page
            cy.contains("Details").click({force: true});
        });

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

        cy.wait(500); // TODO check why we need to wait here

        logout();
        deleteOffering(offeringId);
    });
});