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
    name: 'Benutzerverwaltung',
    url: '/users',
    iconComponent: { name: 'cil-user' },
    allowedRoles: ['Rep'],
    children: [
      {
        name: 'Nutzer meiner Organisation anzeigen',
        url: '/users/explore',
        allowedRoles: ['Rep'],
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
