import { ICredentialSubject, ILegalParticipantCs, ILegalRegistrationNumberCs, IMerlotLegalParticipantCs, IVerifiablePresentation } from "../views/organization/organization-data";


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