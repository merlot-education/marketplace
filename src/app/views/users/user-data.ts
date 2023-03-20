export interface IUserAuth {
    username: string,
    userFirstName?: string,
    userLastName?: string,
    companyRoles: ICompanyRole[] 
    loggedIn: boolean
}
  
export interface IUserData {
    username: string;
    registered: string;
    country: string;
    activity: string;
    avatar: string;
    status: string;
}
  
export interface IRole {
    id: number,
    roleName: string,
    roleLongName: string
}

export interface ICompany {
    id: number,
    companyName: string,
    companyLongName: string
}

export interface ICompanyRole {
    company?: ICompany,
    role: IRole
}

export let visitorRole: IRole = {
    id: 0,
    roleName: "Besucher",
    roleLongName: "Besucher"
}

export let orgLegRepRole: IRole = {
    id: 1,
    roleName: "Prokurist",
    roleLongName: "Prokurist"
}

export let orgRepRole: IRole = {
    id: 1,
    roleName: "Repräsentant",
    roleLongName: "Repräsentant"
}

export let gaiaXComp: ICompany =  {
    id: 0,
    companyName: "Gaia-X",
    companyLongName: "Gaia-X European Association for Data and Cloud AISBL"
}


export let dataportComp: ICompany = {
    id: 1,
    companyName: "Dataport",
    companyLongName: "Dataport AöR"
}

export let nachhilfeclubComp: ICompany = {
    id: 2,
    companyName: "Nachhilfeclub",
    companyLongName: "Nachhilfeclub"
}

export let chempointComp: ICompany = {
    id: 3,
    companyName: "ChemPoint",
    companyLongName: "ChemPoint"
}


export let visitorUser: IUserAuth = {
    username: "Besucher",
    companyRoles: [
        {role: visitorRole}
    ],
    loggedIn: false
}

export let dDueseUser: (IUserAuth & IUserData) = {
    username: "DDüse",
    userFirstName: "Daniel",
    userLastName: "Düsentrieb",
    companyRoles: [
        {company: dataportComp, role: orgLegRepRole},
        {company: nachhilfeclubComp, role: orgLegRepRole}
    ],
    loggedIn: true,
    registered: "01.02.2023",
    country: "De",
    activity: "Vor 10 Sekunden",
    avatar: "./assets/img/avatars/default-user.png",
    status: "success",
}

export let jHageUser: (IUserAuth & IUserData) = {
    username: "JHage",
    userFirstName: "Jennifer",
    userLastName: "Hage",
    companyRoles: [
        {company: chempointComp, role: orgLegRepRole}
    ],
    loggedIn: true,
    registered: "01.01.2023",
    country: "De",
    activity: "Vor 5 Minuten",
    avatar: "./assets/img/avatars/default-user.png",
    status: "warning",
}

export let users: (IUserAuth & IUserData)[] = [
    dDueseUser,
    jHageUser
]
