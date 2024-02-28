import { loginAsTestuser, loginAsTestuser2, openOfferingDetails, checkContractInOverview, openContractForEdit, openContractDetails, fillGeneralOfferingFields, logout, archiveReleasedOffering } from "./create-service-offer-common";
import { environment } from '../../src/environments/environment.dev';

it('conclude saas contract', {
    defaultCommandTimeout: 10000
}, () => {
    let inDraft = "In Bearbeitung";
    let consumerSigned = "Vom Kunden unterschrieben";
    let released = "Veröffentlicht";

    // testuser creates a SaaS offering that can be booked:
    // log in as testuser
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

    // the response that the offer is stored will be shown
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", { timeout: 30000 }).should("include.text", "ServiceOffering:").then((result) => {

        // store id of created offering
        let offeringId = result.get(0).innerText.match(/ServiceOffering:[^)]+/)[0];

        // log out as testuser
        logout();

        // testuser2 detects the just created service offer for the LMS. testuser2 books offer and selects options before saving the contract draft:
        // log in as testuser2
        loginAsTestuser2();

        // select the SaaS offering and book it as testuser2
        cy.contains("Service Angebote erkunden").click({ force: true });

        openOfferingDetails(offeringId, null);

        cy.contains("Buchen").click({ force: true });

        cy.wait(500);

        // open the newly created contract and select options
        cy.contains("Vertragskonfiguration zum Service Angebot", { timeout: 30000 }).parent().parent().should("include.text", "Contract:").then((result) => {
            const contractIdRegex = /Contract:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;
            let contractId = result.get(0).innerText.match(contractIdRegex)[0];
            const contractIdArray = contractId.split(":");
            let contractIdWithoutPrefix = contractIdArray[1];

            cy.contains("Vertragsentwurf speichern");
            cy.contains("Vertragsentwurf löschen");
            cy.contains("Kostenpflichtig bestellen");
            cy.contains("Schließen").click({ force: true });

            cy.contains("Meine Verträge").click({ force: true });

            openContractForEdit(contractIdWithoutPrefix, inDraft, offeringName);

            cy.contains("Laufzeit*:").next().next().select("Unbegrenzt");

            cy.contains("Anzahl erlaubter Benutzer*:").next().next().select("Unbegrenzt");

            // save and close the contract draft
            cy.contains("Vertragsentwurf speichern").click({ force: true });
            cy.wait(500);
            cy.contains("Schließen").click({ force: true });

            // check that the just edited contract draft for the SaaS offering should still be in draft
            checkContractInOverview(contractIdWithoutPrefix, inDraft, offeringName);

            // log out as testuser2
            logout();

            // testuser checks contract drafts and updates options:
            // log in as testuser
            loginAsTestuser();

            // check that the contract draft is there and open it
            cy.contains("Meine Verträge").click({ force: true });

            openContractForEdit(contractIdWithoutPrefix, inDraft, offeringName);

            // check that the values of Laufzeit is unbegrenzt and Anzahl erlaubter Benutzer is unbegrenzt
            cy.contains("Laufzeit*:").next().next().contains("Unbegrenzt");

            cy.contains("Anzahl erlaubter Benutzer*:").next().next().contains("Unbegrenzt");

            // select Laufzeit 1 year(s) and Anzahl erlaubter Benutzer Bis zu 100
            cy.contains("Laufzeit*:").next().next().select("1 year(s)");

            cy.contains("Anzahl erlaubter Benutzer*:").next().next().select("Bis zu 100");

            // save and close the contract draft
            cy.contains("Vertragsentwurf speichern").click({ force: true });
            cy.wait(500);
            cy.contains("Schließen").click({ force: true });

            // check that the just edited contract draft for the SaaS offering should still be in draft
            checkContractInOverview(contractIdWithoutPrefix, inDraft, offeringName);

            // log out as testuser
            logout();

            // testuser2 takes compromise and signs:
            // log in as testuser2
            loginAsTestuser2();

            // check that the contract draft is there and open it
            cy.contains("Meine Verträge").click({ force: true });

            openContractForEdit(contractIdWithoutPrefix, inDraft, offeringName);

            // check that the values of Laufzeit is 1 year(s) and Anzahl erlaubter Benutzer Bis zu 100
            cy.contains("Laufzeit*:").next().next().contains("1 year(s)");

            cy.contains("Anzahl erlaubter Benutzer*:").next().next().contains("Bis zu 100");

            // select Laufzeit 2 year(s) and Anzahl erlaubter Benutzer Bis zu 500
            cy.contains("Laufzeit*:").next().next().select("2 year(s)");

            cy.contains("Anzahl erlaubter Benutzer*:").next().next().select("Bis zu 500");

            // click on the checkmark to agree on the AGBs
            cy.get('#checkAGB').click().should('be.checked');

            // sign the contract by clicking on the button Kostenpflichtig bestellen and close the contract draft
            cy.contains("Kostenpflichtig bestellen").click({ force: true });
            cy.wait(500);
            cy.contains("Schließen").click({ force: true });

            // the just edited contract draft for the SaaS offering should now have the status Vom Kunden unterschrieben
            checkContractInOverview(contractIdWithoutPrefix, consumerSigned, offeringName);

            // log out as testuser2
            logout();

            // testuser detects signed contract and agrees:
            // log in as testuser
            loginAsTestuser();

            // check that contract draft is there, has the status Vom Kunden unterschrieben and open it
            cy.contains("Meine Verträge").click({ force: true });

            openContractDetails(contractIdWithoutPrefix, consumerSigned, offeringName);

            // check the fixed values of Laufzeit is 2 year(s) and Anzahl erlaubter Benutzer is Bis zu 500
            cy.contains("Laufzeit*:").next().next().should('be.disabled').contains("2 year(s)");

            cy.contains("Anzahl erlaubter Benutzer*:").next().next().should('be.disabled').contains("Bis zu 500");

            // click on the checkmark to agree on the AGBs
            cy.get('#checkMerlotAGB').click().should('be.checked');

            cy.contains("Bestellung annehmen").click({ force: true });
            cy.wait(500);
            cy.contains("Vertrag archivieren");
            cy.contains("Vertrag herunterladen");
            cy.contains("Schließen").click({ force: true });

            // the just edited contract draft for the SaaS offering should now have the status Veröffentlicht
            checkContractInOverview(contractIdWithoutPrefix, released, offeringName);

            // log out as testuser
            logout();

            // testuser2 downloads contract pdf:
            // log in as testuser2
            loginAsTestuser2();

            // check that the contract draft for the SaaS offering has the status Veröffentlicht and open it
            cy.contains("Meine Verträge").click({ force: true });

            openContractDetails(contractIdWithoutPrefix, released, offeringName);

            // intercept the network request that triggers the contract pdf download
            cy.intercept('GET', environment.contract_api_url + "contract/" + contractId + "/contractPdf").as('downloadRequest');

             // download contract pdf
             cy.contains("Schließen");
             cy.contains("Vertrag archivieren");
             cy.contains("Vertrag herunterladen").click({ force: true });

             // wait for the download request to be sent
             cy.wait('@downloadRequest').then((interception) => {
                  // assert that the request was made
                 expect(interception.response.statusCode).to.equal(200); // check status code 
              });

              cy.contains("Schließen").click({ force: true });

            // log out as testuser2
            logout();

            // log in as testuser, archive the SaaS offering as it is not needed anymore, then log out:
            // log in as testuser
            loginAsTestuser();

            archiveReleasedOffering(offeringId);

            logout();
        
            // check that the offering is no longer in the overview
            cy.contains('Service Angebote erkunden').click({ force: true })
            cy.get("c-card-body").contains(offeringId).should("not.exist");
        });
    });
});