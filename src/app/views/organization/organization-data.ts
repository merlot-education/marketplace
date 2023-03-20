export interface OrganizationData {
    merlotId: string,
    registrationNumber: string,
    registrationType: string,
    name: string,
    countryCode: string,
    postalCode: string,
    street: string,
    iconName: string,
  }


export const orgaData : OrganizationData[] = [
    /*{
        name: "Gaia-X European Association for Data and Cloud AISBL",
        merlotId: "000001",
        registrationNumber: "0762747721",
        registrationType: "local",
        countryCode: "BE",
        postalCode: "1210 BRU",
        street: "Avenue des Arts 6-9",
        iconName: "cil-aperture"
      },
      {
        name: "Dataport AöR",
        merlotId: "000002",
        registrationNumber: "0762747722",
        registrationType: "local",
        countryCode: "D",
        postalCode: "24161 Altenholz",
        street: "Altenholzer Straße 10-14",
        iconName: "cil-bank"
      }*/
      {
        name: "Dataport",
        merlotId: "000001",
        registrationNumber: "",
        registrationType: "",
        countryCode: "De",
        postalCode: "",
        street: "",
        iconName: "cil-storage"
      },
      {
        name: "Nachhilfeclub",
        merlotId: "000002",
        registrationNumber: "",
        registrationType: "",
        countryCode: "De",
        postalCode: "",
        street: "",
        iconName: "cil-school"
      },
      {
        name: "ChemPoint",
        merlotId: "000003",
        registrationNumber: "",
        registrationType: "",
        countryCode: "",
        postalCode: "",
        street: "",
        iconName: "cil-beaker"
      },
      {
        name: "imc",
        merlotId: "000004",
        registrationNumber: "",
        registrationType: "",
        countryCode: "",
        postalCode: "",
        street: "",
        iconName: "cil-school"
      },
]