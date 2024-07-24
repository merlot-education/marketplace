/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Component, Input } from '@angular/core';
import { IContract, IDataDeliveryContract, IIonosS3ConsumerTransferProvisioning } from '../../../../contracts/contracts-data';
import { ConnectorData } from 'src/app/views/organization/organization-data';
import { hasContractAttachments, isContractInDraft, isDataDeliveryContract } from "../../../../../utils/contract-utils";


@Component({
  selector: 'app-consumer-contract-config',
  templateUrl: './consumer-contract-config.component.html',
  styleUrls: ['./consumer-contract-config.component.scss']
})
export class ConsumerContractConfigComponent {
  protected asDataDeliveryContract(val): IDataDeliveryContract { return val };

  protected asIonosConsumerTransferProvisioning(val): IIonosS3ConsumerTransferProvisioning { return val };
  protected isContractInDraft = isContractInDraft;
  protected isDataDeliveryContract = isDataDeliveryContract;
  protected hasContractAttachments = hasContractAttachments;

  @Input() contractDetails: IContract = undefined;
  @Input() availableConnectors : ConnectorData[] = [];

  protected selectedTransferMethod: string;

  ngOnInit(): void {
    this.selectedTransferMethod = this.asDataDeliveryContract(this.contractDetails).provisioning.consumerTransferProvisioning?.dataAddressType;
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
      this.asDataDeliveryContract(this.contractDetails).provisioning.consumerTransferProvisioning = null;
    } else if (this.selectedTransferMethod === "IonosS3Dest") {
      let ionosProvisioning : IIonosS3ConsumerTransferProvisioning = {
        dataAddressTargetBucketName: '',
        dataAddressTargetPath: '',
        dataAddressType: 'IonosS3Dest',
        selectedConnectorId: ''
      };
      this.asDataDeliveryContract(this.contractDetails).provisioning.consumerTransferProvisioning = ionosProvisioning;
    } 
  }

  protected isIonosConsumerTransferProvisioning(contractDetails: IContract): boolean {
    return this.asDataDeliveryContract(contractDetails).provisioning.consumerTransferProvisioning?.dataAddressType === "IonosS3Dest";
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
