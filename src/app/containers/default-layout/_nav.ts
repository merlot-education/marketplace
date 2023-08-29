import { INavData } from '@coreui/angular';

export interface IRoleNavData extends INavData {
  allowedRoles?: string[];
  children?: IRoleNavData[];
}

export const navItems: IRoleNavData[] = [
  /*{
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    },
    allowedRoles: ["visitor", "user", "principal", "admin"],
  },*/

  {
    name: 'Was ist der MERLOT Marktplatz? ',
    url: '/about',
    iconComponent: { name: 'cil-home' },
    allowedRoles: ["visitor", "user", "principal", "admin"],
    children: [
      {
        name: 'Über MERLOT',
        url: '/about/merlot',
        allowedRoles: ["visitor", "user", "principal", "admin"],
      },
      // TODO readd this once needed
      /*{
        name: 'Konsortialpartner',
        url: '/about/consortium',
        allowedRoles: ["visitor", "user", "principal", "admin"],
      },
      {
        name: 'Allgemeine Geschäftsbedingungen',
        url: '/about/terms',
        allowedRoles: ["visitor", "user", "principal", "admin"],
      },*/
    ]
  },
  {
    name: 'Organisationsverwaltung',
    url: '/organization',
    iconComponent: { name: 'cil-notes' },
    allowedRoles: ["visitor", "user", "principal", "admin"],
    children: [
      {
        name: 'Meine Organisation bearbeiten',
        url: '/organization/edit',
        allowedRoles: ["principal", "admin"],
      },
      {
        name: 'Organisationen erkunden',
        url: '/organization/explore',
        allowedRoles: ["visitor", "user", "principal", "admin"],
      },
    ]
  },
  {
    name: 'Benutzerverwaltung',
    url: '/users',
    iconComponent: { name: 'cil-user' },
    allowedRoles: ["user", "principal", "admin"],
    children: [
      // TODO readd this once needed
      /*{
        name: 'Als Nutzer registrieren',
        url: '/users/register',
        allowedRoles: ["user", "principal", "admin"],
      },
      {
        name: 'Nutzer meiner Organisation bearbeiten',
        url: '/users/edit',
        allowedRoles: ["user", "principal", "admin"],
      },*/
      {
        name: 'Nutzer meiner Organisation anzeigen',
        url: '/users/explore',
        allowedRoles: ["user", "principal", "admin"],
      },
    ]
  },
  {
    name: 'Service Angebote',
    url: '/service-offerings',
    iconComponent: { name: 'cil-puzzle' },
    allowedRoles: ["visitor", "user", "principal", "admin"],
    children: [
      {
        name: 'Service Angebot erstellen',
        url: '/service-offerings/edit',
        allowedRoles: ["principal", "admin"],
      },
      {
        name: 'Service Angebote erkunden',
        url: '/service-offerings/explore',
        allowedRoles: ["visitor", "user", "principal", "admin"],
      },
    ]
  },
  {
    name: 'Meine Verträge',
    url: '/contracts/explore',
    iconComponent: { name: 'cil-balance-scale' },
    allowedRoles: ["visitor", "user", "principal", "admin"],
  },
];
