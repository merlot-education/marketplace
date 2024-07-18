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

import { IRoleNavData } from '@merlot-education/m-dashboard-ui';

export const navItems: IRoleNavData[] = [
  {
    name: 'Was ist der MERLOT Marktplatz? ',
    url: '/about',
    iconComponent: { name: 'cil-home' },
    allowedRoles: ['Visitor', 'Rep', 'FedAdmin'],
    children: [
      {
        name: 'Über MERLOT',
        url: '/about/merlot',
        allowedRoles: ['Visitor', 'Rep', 'FedAdmin'],
      },
    ],
  },
  {
    name: 'Organisationsverwaltung',
    url: '/organization',
    iconComponent: { name: 'cil-notes' },
    allowedRoles: ['Visitor', 'Rep', 'FedAdmin'],
    children: [
      {
        name: 'Meine Organisation bearbeiten',
        url: '/organization/edit',
        allowedRoles: ['Rep'],
      },
      {
        name: 'Organisationen erkunden',
        url: '/organization/explore',
        allowedRoles: ['Visitor', 'Rep', 'FedAdmin'],
      },
    ],
  },
  {
    name: 'Service Angebote',
    url: '/service-offerings',
    iconComponent: { name: 'cil-puzzle' },
    allowedRoles: ['Visitor', 'Rep', 'FedAdmin'],
    children: [
      {
        name: 'Service Angebot erstellen',
        url: '/service-offerings/edit',
        allowedRoles: ['Rep'],
      },
      {
        name: 'Service Angebote erkunden',
        url: '/service-offerings/explore',
        allowedRoles: ['Visitor', 'Rep', 'FedAdmin'],
      },
    ],
  },
  {
    name: 'Meine Verträge',
    url: '/contracts/explore',
    iconComponent: { name: 'cil-balance-scale' },
    allowedRoles: ['Rep'],
  },
];
