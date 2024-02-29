import { loginAsUser, openOfferingDetails, checkOfferingInOverview, logout, archiveReleasedOffering, createAndReleaseDataDeliveryOffering } from "./create-service-offer-common";
import { consumerSigned, released, revoked, testuser, testuser2, testuserName, testuserOrga, testuser2Name, testuser2Orga, checkContractInOverview, openContractDetails} from "./conclude-contract-common";

it('conclude and cancel data delivery contract', {
    defaultCommandTimeout: 10000
}, () => {
    // testuser creates a data delivery offering that can be booked:
    // log in as testuser
    loginAsUser(testuser, testuser, testuserName, testuserOrga);

    // prepare some data to fill in the form
    let offeringName = "Brandneue Jobangebote";
    let offeringDescription = "Ob Praktika, Ausbildungen, Werkstudentenjobs oder Festanstellungen... Wir schicken Ihnen immer die neusten Stellenanzeigen bei Gaia-X für Ihre Plattform, um Ihren Nutzern offene Jobangebote mit tollen Perspektiven und Entwicklungsmöglichkeiten in der IT-Industrie zu bieten und ein “perfect Match” zu finden. Lösungen sind unser Job!";
    let offeringCosts = "5€ pro Stellenanzeige, 10€ Prämie pro Match";
    let dataTransfertype = "Push";
    let dataAccessType = "Download";
    let dataExchangeOptions = [2, 4, 12, 0];
    let runtimeOptions = [1, 2, 0];
    let runtimeOptionsSelect = ["year(s)", "year(s)", "unlimited"];
    let offeringTncLink = "https://merlot.test.de/tnc"
    let offeringTncHash = "hash12345678";

    createAndReleaseDataDeliveryOffering(offeringName, offeringDescription, offeringCosts, dataTransfertype, dataAccessType, dataExchangeOptions, runtimeOptions, runtimeOptionsSelect, offeringTncLink, offeringTncHash);
    
    // the response that the offer is stored will be shown
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", { timeout: 30000 }).should("include.text", "ServiceOffering:").then((result) => {

        // store id of created offering
        let offeringId = result.get(0).innerText.match(/ServiceOffering:[^)]+/)[0];

        // click on navigation entry Angebote erkunden, the created offer is shown on top of the page
        cy.contains("Service Angebote erkunden").click();
        checkOfferingInOverview(offeringId, null);

        // log out as testuser
        logout();

        // testuser2 detects the just created data delivery service offer (push) for open job positions. testuser2 books offer and selects options before saving the contract draft:
        // log in as testuser2
        loginAsUser(testuser2, testuser2, testuser2Name, testuser2Orga);

        // select the data delivery offering and book it as testuser2
        cy.contains("Service Angebote").click();
        cy.contains("Service Angebote erkunden").click();

        openOfferingDetails(offeringId, null);

        cy.contains("Datentransferart:").parent().should("include.text", "Push");

        cy.contains("Buchen").click({ force: true });

        cy.wait(500);

        // select options for the newly created contract
        cy.contains("Vertragskonfiguration zum Service Angebot", { timeout: 30000 }).parent().parent().should("include.text", "Contract:").then((result) => {
            const contractIdRegex = /Contract:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;
            let contractId = result.get(0).innerText.match(contractIdRegex)[0];
            const contractIdArray = contractId.split(":");
            let contractIdWithoutPrefix = contractIdArray[1];

            cy.contains("Vertragsentwurf speichern");
            cy.contains("Vertragsentwurf löschen");
            cy.contains("Kostenpflichtig bestellen");
            cy.contains("Schließen");

            // select Laufzeit 1 year(s), Anzahl erlaubter Datenaustausche Bis zu 12, Aktiver EDC Connector edc1, 
            // IONOS-S3 Ziel-Bucket merlot-edc-dataport and Ziel-Dateipfad im IONOS-S3 Bucket Gaia-X_Jobs.json

            cy.contains("Laufzeit*:").next().next().select("1 year(s)");
            cy.contains("Anzahl erlaubter Datenaustausche*:").next().next().select("Bis zu 12");
            cy.contains("Aktiver EDC Connector*:").next().next().select("edc1");
            cy.contains("IONOS-S3 Ziel-Bucket*").next().next().select("merlot-edc-dataport");
            cy.get('label:contains("Ziel-Dateipfad im IONOS-S3 Bucket*") + input')
                .type("Gaia-X_Jobs.json");

            // click on the checkmark to agree on the AGBs
            cy.get('#checkAGB').click().should('be.checked');

            // sign the contract by clicking on the button Kostenpflichtig bestellen and close the contract draft
            cy.contains("Kostenpflichtig bestellen").click({ force: true });
            cy.wait(500);
            cy.contains("Vertrag widerrufen");
            cy.contains("Schließen").click({ force: true });

            // the just edited contract draft for the data delivery offering should now have the status Vom Kunden unterschrieben
            cy.contains("Meine Verträge").click({ force: true });
            checkContractInOverview(contractIdWithoutPrefix, consumerSigned, offeringName);

            // log out as testuser2
            logout();

            // testuser detects signed contract, selects options, agrees to contract and starts data transfer:
            // log in as testuser
            loginAsUser(testuser, testuser, testuserName, testuserOrga);

            // check that contract draft is there, has the status Vom Kunden unterschrieben and open it
            cy.contains("Meine Verträge").click({ force: true });

            openContractDetails(contractIdWithoutPrefix, consumerSigned, offeringName);

            // check the fixed values of Laufzeit is 1 year(s), Anzahl erlaubter Datenaustausche is Bis zu 12
            // all technical settings of the consumer are invisible for the data provider
            cy.contains("Laufzeit*:").next().next().should('be.disabled').contains("1 year(s)");
            cy.contains("Anzahl erlaubter Datenaustausche*:").next().next().should('be.disabled').contains("Bis zu 12");
            cy.contains("IONOS-S3 Ziel-Bucket*").should("not.exist");
            cy.contains("Ziel-Dateipfad im IONOS-S3 Bucket*").should("not.exist");

            // select Aktiver EDC Connector edc2, IONOS-S3 Quell-Bucket merlot-edc-gaiax and Quell-Dateipfad im IONOS-S3 Bucket jobs4dp/DPjobs01.json, Typ der Datenadresse IonosS3
            cy.contains("Aktiver EDC Connector*:").next().next().select("edc2");
            cy.contains("IONOS-S3 Quell-Bucket*").next().next().select("merlot-edc-gaiax");
            cy.get('label:contains("Quell-Dateipfad im IONOS-S3 Bucket*") + input').type("jobs4dp/DPjobs01.json");
            cy.contains("Typ der Datenadresse*").next().next().select("IonosS3");

            // click on the checkmark to agree on the AGBs
            cy.get('#checkMerlotAGB').click().should('be.checked');

            cy.contains("Bestellung annehmen").click({ force: true });
            cy.wait(500);
            cy.contains("Vertrag widerrufen");
            cy.contains("Vertrag archivieren");
            cy.contains("Vertrag herunterladen");
            cy.contains("Schließen");
            cy.contains("Datentransfer starten").click({ force: true });

            cy.wait(500);

            cy.get('c-modal-body', { timeout: 30000 }).should("include.text", "EDC-Übertragung erfolgreich.");

            cy.contains("Schließen").click({ force: true });

            // log out as testuser
            logout();

            // testuser2 cancels contract:
            // log in as testuser2
            loginAsUser(testuser2, testuser2, testuser2Name, testuser2Orga);

            // check that the contract for the data delivery offering has the status Veröffentlicht and open it
            cy.contains("Meine Verträge").click({ force: true });

            openContractDetails(contractIdWithoutPrefix, released, offeringName);

            // cancel the contract
            cy.contains("Vertrag archivieren");
            cy.contains("Vertrag herunterladen");
            cy.contains("Schließen");
            cy.contains("Datentransfer starten").should("be.disabled");
            cy.contains("Vertrag widerrufen").click({ force: true });
            cy.wait(500);
            cy.contains("Vertrag archivieren").should("not.exist");
            cy.contains("Datentransfer starten").should("not.exist");
            cy.contains("Vertrag widerrufen").should("not.exist");
            cy.contains("Vertrag herunterladen");
            cy.contains("Schließen").click({ force: true });

            // check that the contract for the data delivery offering has the status Widerrufen
            checkContractInOverview(contractIdWithoutPrefix, revoked, offeringName);

            // log out as testuser2
            logout();

            // log in as testuser, detect the cancelled contract, archive the data delivery offering as it is not needed anymore, then log out:
            // log in as testuser
            loginAsUser(testuser, testuser, testuserName, testuserOrga);

            cy.contains("Meine Verträge").click({ force: true });

            // activate filter, select Widerrufen, the contract should be the first entry of the list of contracts
            cy.contains("Zeige nur Verträge mit Status:").parent().next().next().select(revoked, { force: true });
            cy.contains("Zeige nur Verträge mit Status:").prev().click({ force: true });
            checkContractInOverview(contractIdWithoutPrefix, revoked, offeringName);

            archiveReleasedOffering(offeringId);

            logout();

            // check that the offering is no longer in the overview
            cy.contains('Service Angebote erkunden').click({ force: true })

            cy.get("c-card-body").contains(offeringId).should("not.exist");
        });
    });
});

it('conclude data delivery contract', {
    defaultCommandTimeout: 10000
}, () => {
    // testuser creates a data delivery offering that can be booked:
    // log in as testuser
    loginAsUser(testuser, testuser, testuserName, testuserOrga);

    // prepare some data to fill in the form
    let offeringName = "Holen Sie sich aktuelle Jobangebote";
    let offeringDescription = "Ob Praktika, Ausbildungen, Werkstudentenjobs oder Festanstellungen... Holen Sie sich bei Bedarf die aktuellen Stellenanzeigen bei Gaia-X für Ihre Plattform, um Ihren Nutzern offene Jobangebote mit tollen Perspektiven und Entwicklungsmöglichkeiten in der IT-Industrie zu bieten und ein “perfect Match” zu finden. Lösungen sind unser Job!";
    let offeringCosts = "5€ pro Stellenanzeige, 10€ Prämie pro Match";
    let dataTransfertype = "Pull";
    let dataAccessType = "Download";
    let dataExchangeOptions = [2, 4, 12, 0];
    let runtimeOptions = [1, 2, 0];
    let runtimeOptionsSelect = ["year(s)", "year(s)", "unlimited"];
    let offeringTncLink = "https://merlot.test.de/tnc"
    let offeringTncHash = "hash12345678";

    createAndReleaseDataDeliveryOffering(offeringName, offeringDescription, offeringCosts, dataTransfertype, dataAccessType, dataExchangeOptions, runtimeOptions, runtimeOptionsSelect, offeringTncLink, offeringTncHash);
    
    // the response that the offer is stored will be shown
    cy.contains("Selbstbeschreibung erfolgreich gespeichert!", { timeout: 30000 }).should("include.text", "ServiceOffering:").then((result) => {

        // store id of created offering
        let offeringId = result.get(0).innerText.match(/ServiceOffering:[^)]+/)[0];

        // click on navigation entry Angebote erkunden, the created offer is shown on top of the page
        cy.contains("Service Angebote erkunden").click();
        checkOfferingInOverview(offeringId, null);

        // log out as testuser
        logout();

        // testuser2 detects the just created datadelivery service offer (pull) for open job positions. testuser2 books offer and selects options before saving the contract draft:
        // log in as testuser2
        loginAsUser(testuser2, testuser2, testuser2Name, testuser2Orga);

        // select the data delivery offering and book it as testuser2
        cy.contains("Service Angebote").click();
        cy.contains("Service Angebote erkunden").click();

        openOfferingDetails(offeringId, null);

        cy.contains("Datentransferart:").parent().should("include.text", "Pull");

        cy.contains("Buchen").click({ force: true });

        cy.wait(500);

        // select options for the newly created contract
        cy.contains("Vertragskonfiguration zum Service Angebot", { timeout: 30000 }).parent().parent().should("include.text", "Contract:").then((result) => {
            const contractIdRegex = /Contract:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;
            let contractId = result.get(0).innerText.match(contractIdRegex)[0];
            const contractIdArray = contractId.split(":");
            let contractIdWithoutPrefix = contractIdArray[1];

            cy.contains("Vertragsentwurf speichern");
            cy.contains("Vertragsentwurf löschen");
            cy.contains("Kostenpflichtig bestellen");
            cy.contains("Schließen");

            // select Laufzeit 2 year(s), Anzahl erlaubter Datenaustausche Unbegrenzt, Aktiver EDC Connector edc2, 
            // IONOS-S3 Ziel-Bucket merlot-edc-dataport and Ziel-Dateipfad im IONOS-S3 Bucket Gaia-XJobs/OpenJobs.json

            cy.contains("Laufzeit*:").next().next().select("2 year(s)");
            cy.contains("Anzahl erlaubter Datenaustausche*:").next().next().select("Unbegrenzt");
            cy.contains("Aktiver EDC Connector*:").next().next().select("edc2");
            cy.contains("IONOS-S3 Ziel-Bucket*").next().next().select("merlot-edc-dataport");
            cy.get('label:contains("Ziel-Dateipfad im IONOS-S3 Bucket*") + input')
                .type("Gaia-XJobs/OpenJobs.json");

            // click on the checkmark to agree on the AGBs
            cy.get('#checkAGB').click().should('be.checked');

            // sign the contract by clicking on the button Kostenpflichtig bestellen and close the contract draft
            cy.contains("Kostenpflichtig bestellen").click({ force: true });
            cy.get('c-modal-body', { timeout: 10000 }).should("include.text", "Vertragskonfiguration gespeichert.");
            cy.contains("Vertrag widerrufen");
            cy.contains("Schließen").click({ force: true });

            // the just edited contract draft for the data delivery offering should now have the status Vom Kunden unterschrieben
            cy.contains("Meine Verträge").click({ force: true });
            checkContractInOverview(contractIdWithoutPrefix, consumerSigned, offeringName);

            // log out as testuser2
            logout();

            // testuser detects signed contract, selects options and agrees to contract:
            // log in as testuser
            loginAsUser(testuser, testuser, testuserName, testuserOrga);

            // check that contract draft is there, has the status Vom Kunden unterschrieben and open it
            cy.contains("Meine Verträge").click({ force: true });

            openContractDetails(contractIdWithoutPrefix, consumerSigned, offeringName);

            // check the fixed values of Laufzeit is 2 year(s), Anzahl erlaubter Datenaustausche is Unbegrenzt
            // all technical settings of the consumer are invisible for the data provider
            cy.contains("Laufzeit*:").next().next().should('be.disabled').contains("2 year(s)");
            cy.contains("Anzahl erlaubter Datenaustausche*:").next().next().should('be.disabled').contains("Unbegrenzt");
            cy.contains("IONOS-S3 Ziel-Bucket*").should("not.exist");
            cy.contains("Ziel-Dateipfad im IONOS-S3 Bucket*").should("not.exist");

            // select Aktiver EDC Connector edc1, IONOS-S3 Quell-Bucket merlot-edc-gaiax and Quell-Dateipfad im IONOS-S3 Bucket Jobs4DP.json, Typ der Datenadresse IonosS3
            cy.contains("Aktiver EDC Connector*:").next().next().select("edc1");
            cy.contains("IONOS-S3 Quell-Bucket*").next().next().select("merlot-edc-gaiax");
            cy.get('label:contains("Quell-Dateipfad im IONOS-S3 Bucket*") + input').type("Jobs4DP.json");
            cy.contains("Typ der Datenadresse*").next().next().select("IonosS3");

            // click on the checkmark to agree on the AGBs and accept
            cy.get('#checkMerlotAGB').click().should('be.checked');
            cy.contains("Bestellung annehmen").click({ force: true });

            // the message "Vertragskonfiguration gespeichert." should appear and the Datentransferart of the signed contract is Pull
            cy.get('c-modal-body', { timeout: 10000 }).should("include.text", "Vertragskonfiguration gespeichert.");
            cy.contains("Datentransferart:").parent().should("include.text", "Pull");

            cy.contains("Vertrag widerrufen");
            cy.contains("Vertrag archivieren");
            cy.contains("Vertrag herunterladen");
            cy.contains("Datentransfer starten").should("be.disabled");
            cy.contains("Schließen").click({ force: true });

            // check that the contract for the data delivery offering has the status Veröffentlicht
            checkContractInOverview(contractIdWithoutPrefix, released, offeringName);

            // log out as testuser
            logout();

            // testuser2 starts datatransfer:
            // log in as testuser2
            loginAsUser(testuser2, testuser2, testuser2Name, testuser2Orga);

            // check that the contract for the data delivery offering has the status Veröffentlicht and open it
            cy.contains("Meine Verträge").click({ force: true });

            openContractDetails(contractIdWithoutPrefix, released, offeringName);

            // check that Datentransferart is Pull
            cy.contains("Datentransferart:").parent().should("include.text", "Pull");

            // trigger datatransfer and close contract details view
            cy.contains("Vertrag archivieren");
            cy.contains("Vertrag herunterladen");
            cy.contains("Schließen");
            cy.contains("Vertrag widerrufen");
            cy.contains("Datentransfer starten").click({ force: true });

            cy.get('c-modal-body', { timeout: 10000 }).should("include.text", "EDC-Übertragung läuft.");
            cy.get('c-modal-body', { timeout: 30000 }).should("include.text", "EDC-Übertragung erfolgreich.");
            
            cy.contains("Schließen").click({ force: true });

            // log out as testuser2
            logout();

            // log in as testuser, revoke the contract and archive the data delivery offering as they are not needed anymore, then log out:
            // log in as testuser
            loginAsUser(testuser, testuser, testuserName, testuserOrga);

            cy.contains("Meine Verträge").click({ force: true });

            openContractDetails(contractIdWithoutPrefix, released, offeringName);

            cy.contains("Vertrag archivieren");
            cy.contains("Vertrag herunterladen");
            cy.contains("Schließen");
            cy.contains("Datentransfer starten");
            cy.contains("Vertrag widerrufen").click({ force: true });
            cy.wait(500);
            cy.contains("Vertrag archivieren").should("not.exist");
            cy.contains("Datentransfer starten").should("not.exist");
            cy.contains("Vertrag widerrufen").should("not.exist");
            cy.contains("Vertrag herunterladen");
            cy.contains("Schließen").click({ force: true });

            // check that the contract for the data delivery offering has the status Widerrufen
            checkContractInOverview(contractIdWithoutPrefix, revoked, offeringName);

            archiveReleasedOffering(offeringId);

            logout();

            // check that the offering is no longer in the overview
            cy.contains('Service Angebote erkunden').click({ force: true })

            cy.get("c-card-body").contains(offeringId).should("not.exist");
        });
    });
});