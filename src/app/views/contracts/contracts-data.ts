export interface IContract {
    id: string;
    offeringId: string;
    creationDate: string;
    provider: string;
    consumer: string;
    offeringName: string;
    state: string;
    // provider and service name come from the offering attached to this contract
}

export let demoContracts: IContract[] = [
    {
        id: "1234",
        offeringId: "ServiceOffering:ee288fc1-ede7-4a6d-9db2-4034d60fd2fd",
        creationDate: "01.01.2023",
        provider: "Participant:20",
        consumer: "Participant:10",
        offeringName: "DemoOffering1",
        state: "IN_DRAFT"
    },
    {
        id: "5678",
        offeringId: "ServiceOffering:e5268e62-2bb7-4b6b-be73-c421e27d8ea9",
        creationDate: "01.01.2023",
        provider: "Participant:10",
        consumer: "Participant:20",
        offeringName: "DemoOffering2",
        state: "RELEASED"
    },
    {
        id: "1357",
        offeringId: "ServiceOffering:e7391eee-f758-48b4-b306-d49a046a6ee4",
        creationDate: "01.01.2023",
        provider: "Participant:30",
        consumer: "Participant:10",
        offeringName: "DemoOffering3",
        state: "DELETED"
    }
]