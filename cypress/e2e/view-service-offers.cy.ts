beforeEach(() => {
  cy.visit('/')
})

it('open service offerings', {
  defaultCommandTimeout: 10000
}, () => {
  cy.contains('Service Angebote').click()
  cy.contains('Service Angebote erkunden').click()
  cy.url().should('include', 'service-offerings/explore')
})
