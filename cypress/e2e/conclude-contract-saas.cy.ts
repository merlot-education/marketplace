import { loginAsTestuser, loginAsTestuser2, openOfferingDetails, openContractForEdit, fillGeneralOfferingFields, logout, deleteOffering } from "./create-service-offer-common";

it('conclude saas contract', {
    defaultCommandTimeout: 10000
}, () => {
    // log in as testuser, create the SaaS offering to be booked, then log out
    loginAsTestuser();

    let offeringName = "Lernplattform (LMS) für betriebliche Weiterbildung (SaaS)";
    let offeringDescription = "Bewältigen Sie Ihre Enterprise Anforderungen mit der perfekten Kombination aus Learning Management System und Learning Experience Platform. Nutzen Sie Daten über sich ändernde Skill- und Kompetenzanforderungen und den Fachkräftemarkt Ihrer Branche, um Ihre Weiterbildungsprozesse automatisch anzupassen. Dazu ermöglicht das LMS der imc AG als SaaS eine besonders einfache Anbindung an den MERLOT Datenraum, der sichere Verarbeitung und Verwertung von Ihren Daten garantiert und in dem Sie in Kontrolle Ihrer Daten bleiben.";
    let offeringTncLink = "https://merlot.test.de/tnc"
    let offeringTncHash = "hash12345678";
    let offeringCosts = "Abonnement, Verhandlungsbasis";
    let offeringHWRequirements = "Software as a Service";
    let userCountOptions = [100, 500, 1000, 0];
    let runtimeOptions = [1, 2, 0];
    let runtimeOptionsSelect = ["year(s)", "year(s)", "unlimited"];

    let offeringId = createTestSaasOffer(offeringName, offeringDescription, offeringTncLink, offeringTncHash, offeringCosts, offeringHWRequirements, userCountOptions, runtimeOptions, runtimeOptionsSelect);

    logout();

    // log in as testuser2, select the SaaS offering and book it

    loginAsTestuser2();

    cy.contains("Service Angebote erkunden").click({ force: true });

    openOfferingDetails(offeringId, null);

    cy.contains("Buchen").click({ force: true });

    let contractId;
    cy.contains("Vertragskonfiguration zum Service Angebot", { timeout: 30000 }).should("include.text", "Contract:").then((result) => {
        const contractIdRegex = /Contract:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;
        contractId = result.get(0).innerText.match(contractIdRegex)[0];

    });

    cy.contains("Vertragsentwurf speichern");
    cy.contains("Vertragsentwurf löschen");
    cy.contains("Kostenpflichtig bestellen");
    cy.contains("Schließen").click({ force: true });

    // open the created contract to select options and save the contract draft
    cy.contains("Meine Verträge").click({ force: true });

    openContractForEdit(contractId, offeringName);

    


    // testuser2
    logout();

    //log in as testuser, delete the SaaS offering, then log out
    loginAsTestuser();

    deleteOffering(offeringId);

    logout();
});

function createTestSaasOffer(offeringName: string, offeringDescription: string, offeringTncLink: string, offeringTncHash: string, offeringCosts: string, offeringHWRequirements: string, userCountOptions: number[], runtimeOptions: number[], runtimeOptionsSelect: string[]): string {

    // click on navigation entry Serviceangebote,  the submenu is extended
    cy.contains('Service Angebote').click({ force: true })

    // click on navigation entry Serviceangebot erstellen, the form will be displayed on the right side of the screen
    cy.contains('Service Angebot erstellen').click({ force: true })

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

    // make sure publish button is no longer disabled
    // click on button "Veröffentlichen"
    cy.contains("Veröffentlichen").should("not.be.disabled").scrollIntoView().click({ force: true });

    // the response that the offer is stored will be shown
    let offeringId;
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", { timeout: 30000 }).should("include.text", "ServiceOffering:").then((result) => {

        // store id of created offering
        offeringId = result.get(0).innerText.match(/ServiceOffering:[^)]+/)[0];
    })
    return offeringId;
}