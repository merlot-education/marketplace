beforeEach(() => {
  cy.visit('/')
})

it('open service offerings', () => {
  cy.contains('Service Angebote').click()
  cy.contains('Service Angebote erkunden').click()
  cy.url().should('include', 'service-offerings/explore')
})

it('test that intentionally fails', () => {
  cy.url().should('include', 'service-offerings/explore')
})
