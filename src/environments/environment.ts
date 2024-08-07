/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
  ktc_link_data_transfer: 'https://ktc.merlot-education.eu/for_companies/data-transfer/', 
  merlot_song_url: 'https://merlot-storage-test.s3-eu-central-1.ionoscloud.com/MERLOT-Bildung_neu_definiert.mp3'
};
