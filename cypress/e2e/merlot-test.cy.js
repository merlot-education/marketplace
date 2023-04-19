/// <reference types="cypress" />

context('Actions', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/')
  })

  /*it('.click() - click on a DOM element', () => {
    // https://on.cypress.io/click
    cy.get('#login-button').click()
    cy.get('#role-select').should('be.visible').select(1, {force: true})
    cy.get('#role-select').should('have.value', 'Prokurist für Nachhilfeclub')
    cy.get('#role-select').should('not.have.value', 'Prokurist für Dataport')
    cy.get('#logout-button').click()
  })*/

  
})
