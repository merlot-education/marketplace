it('open service offerings', () => {
  cy.visit('https://marketplace.dev.merlot-education.eu')

  cy.contains('Service Angebote').click()
  cy.contains('Service Angebote erkunden').click()
  cy.url().should('include', 'service-offerings/explore')
})

it('test that intentionally fails', () => {
  cy.visit('https://marketplace.dev.merlot-education.eu')

  cy.url().should('include', 'service-offerings/explore')
})