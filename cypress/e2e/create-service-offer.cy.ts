beforeEach(() => {
    cy.visit('/')
    // click login will redirect to keycloak, use testuser to login
    cy.get("#login-button").click();

    cy.get("#username").type("testuser");
    cy.get("#password").type("testuser");
    cy.get("#kc-login").click();
})

it('create service offering', () => {
    cy.contains('Service Angebote').click()
    cy.contains('Service Angebot erstellen').click()
    cy.url().should('include', 'service-offerings/edit')
    cy.contains('Art des Service Angebots').next().select("Webanwendung");
    cy.contains("Füllen Sie das MerlotServiceOfferingSaaS Formular aus");

    cy.contains("Änderungen speichern").should("be.disabled");

    cy.contains("Servicename").next().type("Bla", {force: true});

    cy.contains("Service Bereitsteller").next().invoke('val').should("not.be.empty");
    cy.contains("Service Anbieter").next().invoke('val').should("not.be.empty");

    cy.contains("Detaillierte Beschreibung des Services").next().type("Bla", {force: true});
    cy.contains("Merlot AGB").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        cy.get("button").click({force: true});
    });
    cy.contains("Serviceangebotspezifische Geschäftsbedingungen").scrollIntoView().click({force: true}).parent().parent().parent().parent().parent().within(() => {
        cy.contains("Link zum Inhalt").next().type("Link", {force: true});
        cy.contains("Hash des Dokuments").next().type("Hash", {force: true});
    });
    cy.contains("Beispielkosten").next().type("Bla", {force: true});
    cy.contains("Anforderungen an die Hardware").next().type("Bla", {force: true});
    cy.contains("Nutzeranzahl-Option").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        cy.get("button").click({force: true}).click({force: true}).click({force: true});
    });

    let userCountOptions = [0, 1, 2, 3];

    cy.get('mat-expansion-panel-header:visible:contains("Nutzeranzahl-Option")').should("have.length", 4).each(($el, index, $list) => {
        if (index !== 0) {
            cy.wrap($el).click({force: true});
        } 
        cy.wrap($el).parent().parent().parent().contains("Option für maximale Nutzerzahl").next().type(userCountOptions[index] + "", {force: true});
    });

    cy.contains("Laufzeit-Option").scrollIntoView().parent().parent().parent().parent().parent().within(() => {
        cy.get("button").click({force: true}).click({force: true});
    });

    let runtimeOptions = [0, 1, 2];
    let runtimeOptionsSelect = ["day(s)", "day(s)", "day(s)"];

    cy.get('mat-expansion-panel-header:visible:contains("Laufzeit-Option")').should("have.length", 3).each(($el, index, $list) => {
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
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", {timeout: 30000}).should("include.text", "ServiceOffering:");
})