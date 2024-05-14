import { loginAsUser, openOfferingDetails, createAndReleaseSaaSOffering, logout, archiveReleasedOffering } from "./create-service-offer-common";
import { inDraft, consumerSigned, released, testuserName, testuserOrga, testuser2Name, testuser2Orga, openContractForEdit, checkContractInOverview, openContractDetails} from "./conclude-contract-common";
import { environment } from '../../src/environments/environment.dev';

it('conclude saas contract', {
    defaultCommandTimeout: 10000
}, () => {
    // testuser creates a SaaS offering that can be booked:
    // log in as testuser
    loginAsUser(testuserName, testuserOrga);

    let offeringName = "Lernplattform (LMS) für betriebliche Weiterbildung (SaaS)";
    let offeringDescription = "Bewältigen Sie Ihre Enterprise Anforderungen mit der perfekten Kombination aus Learning Management System und Learning Experience Platform. Nutzen Sie Daten über sich ändernde Skill- und Kompetenzanforderungen und den Fachkräftemarkt Ihrer Branche, um Ihre Weiterbildungsprozesse automatisch anzupassen. Dazu ermöglicht das LMS der Gaia-X AISBL als SaaS eine besonders einfache Anbindung an den MERLOT Datenraum, der sichere Verarbeitung und Verwertung von Ihren Daten garantiert und in dem Sie in Kontrolle Ihrer Daten bleiben.";
    let offeringCosts = "Abonnement, Verhandlungsbasis";
    let offeringHWRequirements = "Software as a Service";
    let userCountOptions = [100, 500, 1000, 0];
    let runtimeOptions = [1, 2, 0];
    let runtimeOptionsSelect = ["year(s)", "year(s)", "unlimited"];

    createAndReleaseSaaSOffering(offeringName, offeringDescription, offeringCosts, offeringHWRequirements, userCountOptions, runtimeOptions, runtimeOptionsSelect)

    // the response that the offer is stored will be shown
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", { timeout: 30000 }).should("include.text", "ServiceOffering:").then((result) => {

        // store id of created offering
        let offeringId = result.get(0).innerText.match(/ServiceOffering:[^)]+/)[0];

        // log out as testuser
        logout();

        // testuser2 detects the just created service offer for the LMS. testuser2 books offer and selects options before saving the contract draft:
        // log in as testuser2
        loginAsUser(testuser2Name, testuser2Orga);

        // select the SaaS offering and book it as testuser2
        cy.contains("Service Angebote").click({ force: true });
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

            // open the contract draft which should be in state In Bearbeitung to edit it
            openContractForEdit(contractIdWithoutPrefix, inDraft, offeringName);

            // select Laufzeit Unbegrenzt and Anzahl erlaubter Benutzer Unbegrenzt
            cy.contains("Laufzeit*:").next().next().select("Unbegrenzt");
            cy.contains("Anzahl erlaubter Benutzer*:").next().next().select("Unbegrenzt");

            // save and close the contract draft
            cy.contains("Vertragsentwurf speichern").click({ force: true });
            cy.wait(500);
            cy.contains("Schließen").click({ force: true });

            // check that the just edited contract draft for the SaaS offering is still in draft
            checkContractInOverview(contractIdWithoutPrefix, inDraft, offeringName);

            // log out as testuser2
            logout();

            // testuser checks contract drafts and updates options:
            // log in as testuser
            loginAsUser(testuserName, testuserOrga);

            // check that the contract draft is there and has status In Bearbeitung, then open it
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
            loginAsUser(testuser2Name, testuser2Orga);

            // check that the contract draft is there and has status In Bearbeitung, then open it
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
            loginAsUser(testuserName, testuserOrga);

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
            loginAsUser(testuser2Name, testuser2Orga);

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

            // log in as testuser, archive contract and the SaaS offering as they are not needed anymore, then log out:
            // log in as testuser
            loginAsUser(testuserName, testuserOrga);

            cy.contains("Meine Verträge").click({ force: true });

            openContractDetails(contractIdWithoutPrefix, released, offeringName);

            cy.contains("Vertrag herunterladen");
            cy.contains("Schließen");
            cy.contains("Vertrag archivieren").click({ force: true });
            cy.wait(500);
            cy.contains("Vertrag archivieren").should("not.exist");
            cy.contains("Vertrag neu erstellen");
            cy.contains("Vertrag herunterladen");
            cy.contains("Schließen").click({ force: true });

            // check that the contract for the data delivery offering has the status Archiviert
            checkContractInOverview(contractIdWithoutPrefix, "Archiviert", offeringName);

            archiveReleasedOffering(offeringId);

            logout();
        
            // check that the offering is no longer in the overview
            cy.contains('Service Angebote erkunden').click({ force: true })
            cy.get("c-card-body").contains(offeringId).should("not.exist");
        });
    });
});