export interface IUserData {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    orgaRole: string;
    email: string;
    attributes?: {[key: string]: string[]};
    createdTimestamp: number;
    enabled: boolean;
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
