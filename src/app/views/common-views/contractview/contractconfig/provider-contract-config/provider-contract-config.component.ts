import { Component, Input, OnInit } from '@angular/core';
import { IContract, IDataDeliveryContract, IIonosS3ProviderTransferProvisioning } from '../../../../contracts/contracts-data';
import { ConnectorData } from 'src/app/views/organization/organization-data';

@Component({
  selector: 'app-provider-contract-config',
  templateUrl: './provider-contract-config.component.html',
  styleUrls: ['./provider-contract-config.component.scss']
})
export class ProviderContractConfigComponent implements OnInit {
  protected asDataDeliveryContract(val): IDataDeliveryContract { return val };
  protected asIonosProviderTransferProvisioning(val): IIonosS3ProviderTransferProvisioning { return val };

  @Input() contractDetails: IContract = undefined;
  @Input() availableConnectors : ConnectorData[] = [];

  protected selectedTransferMethod: string;
  
  ngOnInit(): void {
    this.selectedTransferMethod = this.asDataDeliveryContract(this.contractDetails).provisioning.providerTransferProvisioning?.dataAddressType;
  }

  protected getConnectorBuckets(connectorId: string) {
    try {
      return this.availableConnectors.find(con => con.connectorId === connectorId).ionosS3ExtensionConfig?.buckets.map(b => b.name);
    } catch (e) {
      return [];
    }
  }

  protected onChangeTransferType() {
    if (this.selectedTransferMethod === undefined || this.selectedTransferMethod === "") {
      this.asDataDeliveryContract(this.contractDetails).provisioning.providerTransferProvisioning = null;
    } else if (this.selectedTransferMethod === "IonosS3Source") {
      let ionosProvisioning : IIonosS3ProviderTransferProvisioning = {
        dataAddressSourceBucketName: '',
        dataAddressSourceFileName: '',
        dataAddressType: 'IonosS3Source',
        selectedConnectorId: ''
      };
      this.asDataDeliveryContract(this.contractDetails).provisioning.providerTransferProvisioning = ionosProvisioning;
    } 
  }

  protected isContractInDraft(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'IN_DRAFT';
  }

  protected isContractSignedConsumer(contractDetails: IContract): boolean {
    return contractDetails.details.state === 'SIGNED_CONSUMER';
  }

  protected isDataDeliveryContract(contractDetails: IContract): boolean {
    return contractDetails.offering.selfDescription.verifiableCredential.credentialSubject['@type'] === 'merlot:MerlotServiceOfferingDataDelivery';
  }

  protected isIonosProviderTransferProvisioning(contractDetails: IContract): boolean {
    return this.asDataDeliveryContract(contractDetails).provisioning.providerTransferProvisioning?.dataAddressType === "IonosS3Source";
  }

  protected hasContractAttachments(contractDetails: IContract): boolean {
    return contractDetails.negotiation.attachments.length > 0;
  }

  protected getSelectedProviderConnectorId(): string {
    return this.asDataDeliveryContract(this.contractDetails).provisioning.providerTransferProvisioning?.selectedConnectorId;
  }

  protected getSelectedConsumerConnectorId(): string {
    return this.asDataDeliveryContract(this.contractDetails).provisioning.consumerTransferProvisioning?.selectedConnectorId;
  }

  protected isConnectorIdValid(connectorId: string): boolean {
    if (!connectorId || connectorId.trim().length === 0 || !this.availableConnectors.find(con => con.connectorId === connectorId)) {
      return false;
    }

    return true;
  }

  protected isAnyBucketAvailableForConnector(connectorId: string): boolean {
    let bucketList = this.getConnectorBuckets(connectorId);

    if (!bucketList || bucketList.length === 0) {
      return false;
    }

    return true;
  }
}
