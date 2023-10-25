beforeEach(() => {
    cy.visit('/')
    // click login will redirect to keycloak, use testuser to login
    cy.get("#login-button").click();

    cy.get("#username").type("testuser");
    cy.get("#password").type("testuser");
    cy.get("#kc-login").click();
})

it('create service offering', () => {

    let offeringName = "DRAFT: Lernplattform (LMS) für betriebliche Weiterbildung (SaaS)";
    let offeringDescription = "Bewältigen Sie Ihre Enterprise Anforderungen mit der perfekten Kombination aus Learning Management System und Learning Experience Platform. Nutzen Sie Daten über sich ändernde Skill- und Kompetenzanforderungen und den Fachkräftemarkt Ihrer Branche, um Ihre Weiterbildungsprozesse automatisch anzupassen. Dazu ermöglicht das LMS der imc AG als SaaS eine besonders einfache Anbindung an den MERLOT Datenraum, der sichere Verarbeitung und Verwertung von Ihren Daten garantiert und in dem Sie in Kontrolle Ihrer Daten bleiben.";
    let offeringTncLink = "https://merlot.imc-learning.de/ilp/pages/external-dashboard.jsf?menuId=1501#/?dashboardId=1002"
    let offeringTncHash = "hash15011002";
    let offeringCosts = "Abonnement, Verhandlungsbasis";
    let offeringHWRequirements = "Software as a Service";
    let userCountOptions = [100, 500, 1000, 0];
    let runtimeOptions = [1, 2, 0];
    let runtimeOptionsSelect = ["year(s)", "year(s)", "unlimited"];

    cy.contains('Service Angebote').click()
    cy.contains('Service Angebot erstellen').click()
    cy.url().should('include', 'service-offerings/edit')
    cy.contains('Art des Service Angebots').next().should("not.be.empty").select("Webanwendung");
    cy.contains("Füllen Sie das MerlotServiceOfferingSaaS Formular aus");

    cy.contains("Änderungen speichern").should("be.disabled");

    cy.contains("Servicename").next().type(offeringName, {force: true});

    cy.contains("Service Bereitsteller").next().invoke('val').should("not.be.empty");
    cy.contains("Service Anbieter").next().invoke('val').should("not.be.empty");

    cy.contains("Detaillierte Beschreibung des Services").scrollIntoView().next().type(offeringDescription, {force: true});
    cy.contains("Merlot AGB").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        cy.get("button").click({force: true});
    });
    cy.contains("Serviceangebotspezifische Geschäftsbedingungen").scrollIntoView().click({force: true}).parent().parent().parent().parent().parent().within(() => {
        cy.contains("Link zum Inhalt").next().type(offeringTncLink, {force: true});
        cy.contains("Hash des Dokuments").next().type(offeringTncHash, {force: true});
    });
    cy.contains("Beispielkosten").next().type(offeringCosts, {force: true});
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

    cy.contains("Laufzeit-Option").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        cy.get("button").click({force: true}).click({force: true});
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

    cy.contains("Änderungen speichern").should("not.be.disabled").click();
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", {timeout: 30000}).should("include.text", "ServiceOffering:").then((result) => {
        let offeringId = result.get(0).innerText.match(/ServiceOffering:\S+/)[0];
        cy.contains("Service Angebote erkunden").click();
        cy.contains(offeringId).parent().parent().parent().within(() => {
            cy.contains("Status").parent().should("include.text", "In Bearbeitung");
            cy.contains("Bearbeiten").click({force: true});
        });

        cy.contains("Service Angebot \"" + offeringName + "\" bearbeiten").parent().parent().within(() => {
            offeringName = "Lernplattform (LMS) für betriebliche Weiterbildung (SaaS)";
            cy.contains("Servicename").next().clear({force: true});
            cy.contains("Servicename").next().type(offeringName, {force: true});
            cy.contains("Veröffentlichen").scrollIntoView().click({force: true});
            cy.contains("Selbstbeschreibung erfolgreich gespeichert!");
            cy.contains("Schließen").click();
        });

        cy.contains("Zeige nur Angebote mit Status").parent().next().next().select("Veröffentlicht", {force: true});
        cy.contains("Zeige nur Angebote mit Status").prev().click({force: true});

        cy.contains(offeringId).parent().parent().parent().within(() => {
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            cy.contains("Details").click({force: true});
        });
        cy.contains("Details zum Service Angebot").parent().parent().within(() => {
            cy.contains("Angebotstyp").parent().should("include.text", "Webanwendung");
            cy.contains("Service ID").parent().should("include.text", offeringId);
            cy.contains("Name").parent().should("include.text", offeringName);
            cy.contains("Erstelldatum");
            cy.contains("Anbieter");
            cy.contains("Status").parent().should("include.text", "Veröffentlicht");
            cy.contains("Beschreibung").parent().should("include.text", offeringDescription);
            cy.contains("Letzte Änderung");
            cy.contains("Beispielkosten").parent().should("include.text", offeringCosts);
            cy.contains("Serviceangebotspezifische Geschäftsbedingungen").parent().should("include.text", offeringTncLink).should("include.text", offeringTncHash);
            cy.contains("Hardware-Anforderungen").parent().should("include.text", offeringHWRequirements);
            for (let userOpt of userCountOptions) {
                if (userOpt !== 0) {
                    cy.contains("Optionen für Anzahl erlaubter Benutzer").parent().should("include.text", userOpt);
                } else {
                    cy.contains("Optionen für Anzahl erlaubter Benutzer").parent().should("include.text", "Unbegrenzt");
                }
            }

            for (let runtimeOptIdx = 0; runtimeOptIdx < runtimeOptions.length; runtimeOptIdx++) {
                if (runtimeOptions[runtimeOptIdx] !== 0 && runtimeOptionsSelect[runtimeOptIdx] !== "unlimited") {
                    cy.contains("Laufzeitoptionen").parent().should("include.text", runtimeOptions[runtimeOptIdx] + " " + runtimeOptionsSelect[runtimeOptIdx]);
                } else {
                    cy.contains("Laufzeitoptionen").parent().should("include.text", "Unbegrenzt");
                }
            }
            
            cy.contains("Schließen");
            cy.contains("Angebot neu erstellen");
            cy.contains("Widerrufen").scrollIntoView().click({force: true});
            cy.contains("Status").parent().should("include.text", "Widerrufen");
            cy.contains("Löschen").scrollIntoView().click({force: true});
            cy.contains("Status").parent().should("include.text", "Gelöscht");
            cy.contains("Endgültig löschen").scrollIntoView().click({force: true});
        });
        cy.get("c-card-body").contains(offeringId).should("not.exist");
    });
})