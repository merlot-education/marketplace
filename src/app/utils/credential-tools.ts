import { ICredentialSubject, ILegalParticipantCs, ILegalRegistrationNumberCs, IMerlotLegalParticipantCs, IVerifiablePresentation } from "../views/organization/organization-data";
import { IGxServiceOfferingCs, IMerlotCoopContractServiceOfferingCs, IMerlotDataDeliveryServiceOfferingCs, IMerlotSaasServiceOfferingCs, IMerlotServiceOfferingCs, IServiceOfferingTermsAndConditions } from "../views/serviceofferings/serviceofferings-data";


export function isLegalParticipantCs(cs: ICredentialSubject): boolean {
    return cs && cs.type && cs.type === "gx:LegalParticipant";
}

export function asLegalParticipantCs(cs: ICredentialSubject): ILegalParticipantCs {
    return cs as ILegalParticipantCs;
}

export function isLegalRegistrationNumberCs(cs: ICredentialSubject): boolean {
    return cs && cs.type && cs.type === "gx:legalRegistrationNumber";
}

export function asLegalRegistrationNumberCs(cs: ICredentialSubject): ILegalRegistrationNumberCs {
    return cs as ILegalRegistrationNumberCs;
}

export function isMerlotLegalParticipantCs(cs: ICredentialSubject): boolean {
    return cs && cs.type && cs.type === "merlot:MerlotLegalParticipant";
}

export function asMerlotLegalParticipantCs(cs: ICredentialSubject): IMerlotLegalParticipantCs {
    return cs as IMerlotLegalParticipantCs;
}

export function isGxServiceOfferingCs(cs: ICredentialSubject): boolean {
    return cs && cs.type && cs.type === "gx:ServiceOffering";
}

export function asGxServiceOfferingCs(cs: ICredentialSubject): IGxServiceOfferingCs {
    return cs as IGxServiceOfferingCs;
}

export function isMerlotServiceOfferingCs(cs: ICredentialSubject): boolean {
    return cs && cs.type && cs.type === "merlot:MerlotServiceOffering";
}

export function asMerlotServiceOfferingCs(cs: ICredentialSubject): IMerlotServiceOfferingCs {
    return cs as IMerlotServiceOfferingCs;
}

export function isMerlotSaasServiceOfferingCs(cs: ICredentialSubject): boolean {
    return cs && cs.type && cs.type === "merlot:MerlotSaasServiceOffering";
}

export function asMerlotSaasServiceOfferingCs(cs: ICredentialSubject): IMerlotSaasServiceOfferingCs {
    return cs as IMerlotSaasServiceOfferingCs;
}

export function isMerlotDataDeliveryServiceOfferingCs(cs: ICredentialSubject): boolean {
    return cs && cs.type && cs.type === "merlot:MerlotDataDeliveryServiceOffering";
}

export function asMerlotDataDeliveryServiceOfferingCs(cs: ICredentialSubject): IMerlotDataDeliveryServiceOfferingCs {
    return cs as IMerlotDataDeliveryServiceOfferingCs;
}

export function isMerlotCoopContractServiceOfferingCs(cs: ICredentialSubject): boolean {
    return cs && cs.type && cs.type === "merlot:MerlotCoopContractServiceOffering";
}

export function asMerlotCoopContractServiceOfferingCs(cs: ICredentialSubject): IMerlotCoopContractServiceOfferingCs {
    return cs as IMerlotCoopContractServiceOfferingCs;
}

export function getOrganizationName(vp: IVerifiablePresentation): string {
    if (!vp) {
        return "";
    }
    for (let vc of vp.verifiableCredential) {
        if (vc && isLegalParticipantCs(vc.credentialSubject)) {
            return asLegalParticipantCs(vc.credentialSubject)['gx:name'];
        }
    }
    return "Unbekannt";
}

export function getOrganizationLegalName(vp: IVerifiablePresentation): string {
    if (!vp) {
        return "";
    }
    for (let vc of vp.verifiableCredential) {
        if (vc && isMerlotLegalParticipantCs(vc.credentialSubject)) {
            return asMerlotLegalParticipantCs(vc.credentialSubject)['merlot:legalName'];
        }
    }
    return "Unbekannt";
}

export function getParticipantIdFromParticipantSd(vp: IVerifiablePresentation): string {
    for (let vc of vp.verifiableCredential) {
        if (isLegalParticipantCs(vc.credentialSubject)) {
            return asLegalParticipantCs(vc.credentialSubject).id;
        }
    }
}

export function getOfferingTncFromParticipantSd(participantSd: IVerifiablePresentation): IServiceOfferingTermsAndConditions {
    for (let vc of participantSd.verifiableCredential) {
      if (isMerlotLegalParticipantCs(vc.credentialSubject)) {
        let tnc = asMerlotLegalParticipantCs(vc.credentialSubject)['merlot:termsAndConditions']
        return {
          "gx:URL": tnc['merlot:URL'],
          "gx:hash": tnc["merlot:hash"]
        }
      }
    }
  }

export function getServiceOfferingIdFromServiceOfferingSd(vp: IVerifiablePresentation): string {
    for (let vc of vp.verifiableCredential) {
        if (isGxServiceOfferingCs(vc.credentialSubject)) {
            return asGxServiceOfferingCs(vc.credentialSubject).id;
        }
    }
}

export function getServiceOfferingNameFromServiceOfferingSd(vp: IVerifiablePresentation): string {
    for (let vc of vp.verifiableCredential) {
        if (isGxServiceOfferingCs(vc.credentialSubject)) {
            return asGxServiceOfferingCs(vc.credentialSubject)["gx:name"];
        }
    }
}

export function getServiceOfferingProviderIdFromServiceOfferingSd(vp: IVerifiablePresentation): string {
    for (let vc of vp.verifiableCredential) {
        if (isGxServiceOfferingCs(vc.credentialSubject)) {
            return asGxServiceOfferingCs(vc.credentialSubject)["gx:providedBy"]["id"];
        }
    }
}

export function getMerlotSpecificServiceOfferingTypeFromServiceOfferingSd(vp: IVerifiablePresentation): string {
    for (let vc of vp.verifiableCredential) {
        if (isMerlotSaasServiceOfferingCs(vc.credentialSubject)) {
            return asMerlotSaasServiceOfferingCs(vc.credentialSubject).type;
        } else if (isMerlotDataDeliveryServiceOfferingCs(vc.credentialSubject)) {
            return asMerlotDataDeliveryServiceOfferingCs(vc.credentialSubject).type;
        } else if (isMerlotCoopContractServiceOfferingCs(vc.credentialSubject)) {
            return asMerlotCoopContractServiceOfferingCs(vc.credentialSubject).type;
        }
    }
}

export function getMerlotDataDeliveryServiceOfferingCsFromServiceOfferingSd(vp: IVerifiablePresentation): IMerlotDataDeliveryServiceOfferingCs {
    for (let vc of vp.verifiableCredential) {
        if (isMerlotDataDeliveryServiceOfferingCs(vc.credentialSubject)) {
            return asMerlotDataDeliveryServiceOfferingCs(vc.credentialSubject);
        }
    }
}