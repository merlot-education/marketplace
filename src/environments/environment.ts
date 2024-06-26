// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  marketplace_url: "localhost",
  organizations_api_url: 'http://localhost:8082/api/',
  serviceoffering_api_url: 'http://localhost:8084/api/',
  contract_api_url: 'http://localhost:8086/api/',
  wizard_api_url: 'http://localhost:8084/api/shapes',
  login_authority_url: "http://key-server:8080/realms/POC1",
  login_client_id: "MARKETPLACE",
  daps_server_url: 'http://localhost:4567',
  daps_audience: 'idsc:IDS_CONNECTORS_ALL',
  ktc_link_home: 'https://ktc.merlot-education.eu/',
  ktc_link_offering_creation: 'https://ktc.merlot-education.eu/for_companies/how-to-create-service-offers/',
  ktc_link_contract_booking: 'https://ktc.merlot-education.eu/for_companies/how-to-book-a-contract/',
  ktc_link_registration: 'https://ktc.merlot-education.eu/for_companies/registration-process/',
  ktc_link_data_transfer: 'https://ktc.merlot-education.eu/for_companies/data-transfer/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
