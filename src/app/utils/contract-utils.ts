import { IContract } from "../views/contracts/contracts-data";
import { getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd } from "./credential-tools";

export function isContractInDraft(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'IN_DRAFT';
}

export function isContractReleased(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'RELEASED';
}

export function isContractSignedConsumer(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'SIGNED_CONSUMER';
}

export function isContractDeleted(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'DELETED';
}

export function isContractArchived(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'ARCHIVED';
}

export function isDataDeliveryContract(contractDetails: IContract): boolean {
    return getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd(contractDetails?.offering?.selfDescription) === 'merlot:MerlotDataDeliveryServiceOffering';
}

export function isSaasContract(contractDetails: IContract): boolean {
    return getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd(contractDetails?.offering?.selfDescription) === 'merlot:MerlotSaasServiceOffering';
}

export function hasContractAttachments(contractDetails: IContract): boolean {
    return contractDetails.negotiation.attachments.length > 0;
}