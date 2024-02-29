export function openContractForEdit(contractIdWithoutPrefix: string, status: string, offeringName: string) {
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

export function openContractDetails(contractIdWithoutPrefix: string, status: string, offeringName: string) {
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

export function checkContractInOverview(contractIdWithoutPrefix: string, status: string, offeringName: string){
    cy.contains("ID: " + contractIdWithoutPrefix).parent().parent().within(() => {
        // check status of created contract equals the given status
        cy.contains("Status").parent().should("include.text", status);
        // check associated service of created contract
        cy.contains("Servicename").parent().should("include.text", offeringName);
    });
}