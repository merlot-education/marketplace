beforeEach(() => {
    cy.visit('/');
})

it('testuser can log in, check organization and assigned person data, edit organization data', () => {
    // user is not logged in at this point, check that the welcome text states the user is a visitor
    cy.get("#welcome-text").contains('Willkommen, Besucher!');

    // click login will redirect to keycloak, use testuser to login
    cy.get("#login-button").click();

    cy.get("#username").type("testuser");
    cy.get("#password").type("testuser");
    cy.get("#kc-login").click();

    // at this point we should be redirected again to the MPO and the welcome text should have changed and roles should be visible
    cy.get("#welcome-text").contains('Willkommen, Test User!');
    cy.get("#role-select").should("be.visible");
    cy.get("#role-select").should("contain.text", "Gaia-X");

    // make sure there is "Organisationsverwaltung" and click on it
    cy.contains('Organisationsverwaltung').click();
    // make sure there is "Organisationen erkunden" and click on it
    cy.contains('Organisationen erkunden').click();
    // url should have updated
    cy.url().should('include', 'organization/explore');

    // the organization of testuser, "Gaia-X AISBL", should be visible on page 1
    cy.get('c-card-header').filter(':contains("Gaia-X AISBL")').parent().within(() => {
        // this organization should be marked with "Aktive Rolle"        
        cy.get('c-card-footer').should('have.text', "Aktive Rolle");

        // the pool edcs ("edc1", "edc2") are connected and the corresponding S3 buckets belong to the organization ("merlot-edc-gaiax")
        cy.get('c-card-body').scrollIntoView().within(() => {
            cy.get('table > tbody > tr').then((rows) => {
                for (let row of rows) {
                    cy.wrap(row).contains(/^edc[1|2]$/).next().should('have.text', 'merlot-edc-gaiax');
                }
            });

        });

    });

    cy.contains('Meine Organisation bearbeiten').click()

    let unique = Date.now().toString(36);
    let email = 'merlot-' + unique + '@gaiax.de';
    let agbLink = 'https://www.gaiax.com/de/agb/' + unique + '/';
    let hash = 'hash' + unique;

    let deleteString = '{selectall}{backspace}{selectall}{backspace}';

    // replace value of "Mail-Adresse*" with different one
    cy.contains("Mail-Adresse*").scrollIntoView().next().type(deleteString, { force: true }).type(email, { force: true });

    // replace value of field "Anbieter AGB - Link zum Inhalt*" with different one
    cy.contains("Link zum Inhalt*").scrollIntoView().next().type(deleteString, { force: true }).type(agbLink, { force: true });

    // replace value of field "Anbieter AGB - Hash des Dokuments*" with different one
    cy.contains("Hash des Dokuments*").scrollIntoView().next().type(deleteString, { force: true }).type(hash, { force: true });

    // click on Änderungen speichern, the page shows the following response "Selbstbeschreibung erfolgreich gespeichert! ID: Participant:40"
    cy.contains('Änderungen speichern').should("not.be.disabled").click();
    cy.contains("Selbstbeschreibung erfolgreich gespeichert! (ID: Participant:10)", { timeout: 30000 });

    // click on navigation entry "Benutzerverwaltung", the submenu is extended
    cy.contains('Benutzerverwaltung').click();
    // click on navigation entry "Nutzer meiner Organisation anzeigen"
    cy.contains('Nutzer meiner Organisation anzeigen').click();
    // url should have updated
    cy.url().should('include', 'users/explore');

    // check if all expected persons are shown, we expect following 7 persons: "Jérôme Estienne", "Jan Larwig", "Lilli Karliczek", "Marc Buskies", "Martin Jürgens", "Sebastian Hoyer", "Test User"
    cy.get('c-card-header').should("have.length.at.least", 7).then((headers) => {
        // check if persons are sorted alphabetically by first name -> this check is left out for now
        // the names seem to be sorted alphabetically, but somehow with modification, e.g. é < a

        // check if all expected persons are shown (in no particular order)
        let personNames: string[] = ["Jérôme Estienne", "Jan Larwig", "Lilli Karliczek", "Marc Buskies", "Martin Jürgens", "Sebastian Hoyer", "Test User"];
        let headerNames: string[] = [];

        for (let h of headers) {
            headerNames.push(h.innerText);
        }

        for (let p of personNames) {
            expect(p).to.be.oneOf(headerNames)
        }
    });

    // logout again, after this the welcome text should be for a visitor again
    cy.get("#logout-button").click();
    cy.get("#welcome-text").contains('Willkommen, Besucher!');

    // click on button register, the registration page is visible
    cy.get("#register-button").click();
    // url should have updated
    cy.url().should('include', 'registration');

    // check the mail address of the receiver via the mailTo link, it should contain the mail as saved above 
    const recipient = 'funktionspostfach@merlot.de';
    const cc = email; //mail address that was used above
    const subject = 'Registrierung im MERLOT Portal für Organisationen';
    const body = 'Bitte füllen Sie  das im Knowledge Transfer Center heruntergeladene Formular aus und hängen es dieser Mail an.';

    const mailtoURL = `mailto:${recipient}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    cy.window().then(win => {
        cy.stub(win, 'alert').as('Alert');
    });

    cy.on('window:before:load', (win) => {
        cy.stub(win, 'open').as('Open');
    });

    //select "Gaia-X AISBL" as federator and click on button "Federator bestätigen und Mailprogramm öffnen"
    cy.contains("Gaia-X AISBL").parent().within(() => { cy.get('input').click() });
    cy.contains("Federator bestätigen und Mailprogramm öffnen").click();

    cy.get('@Open').should('have.been.calledOnceWithExactly', mailtoURL, '_blank');
    cy.get("@Alert").should("have.been.calledOnceWithExactly", "Es konnte kein Mailprogramm geöffnet werden.");
});