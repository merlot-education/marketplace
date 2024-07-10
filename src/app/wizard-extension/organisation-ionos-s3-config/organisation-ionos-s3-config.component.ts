/*
 *  Copyright 2023-2024 Dataport AöR
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
import { ConnectorData, IonosS3Bucket } from 'src/app/views/organization/organization-data';

@Component({
  selector: 'app-organisation-ionos-s3-config',
  templateUrl: './organisation-ionos-s3-config.component.html',
  styleUrls: ['./organisation-ionos-s3-config.component.scss']
})
export class OrganisationIonosS3ConfigComponent {
  @Input("connector")
  protected connector: ConnectorData;

  public isIonosS3ExtensionConfigValid(): boolean {
    return this.isConnectorBucketListValid();
  }
    

  protected isConnectorBucketListValid(): boolean {

    if (!this.connector.ionosS3ExtensionConfig) {
      return true;
    }

    // if no buckets provided, the config is invalid
    if (!this.connector.ionosS3ExtensionConfig.buckets 
        || this.connector.ionosS3ExtensionConfig.buckets.length == 0) {
          return false;
    }

    // check if all bucket names are valid
    for (const bucket of this.connector.ionosS3ExtensionConfig.buckets) {
      if (!this.isValidBucket(bucket)) {
        return false;
      }
    }

    return true;
  }

  protected isValidBucket(bucket: IonosS3Bucket) {
    return this.isFieldFilled(bucket.name) && this.isFieldFilled(bucket.storageEndpoint);
  }

  protected isFieldFilled(str: string){
    if (!str || str.trim().length === 0) {
      return false;
    }

    return true;
  }

  public addIonosS3ExtensionConfig() {
    this.connector.ionosS3ExtensionConfig = {
      buckets: [{
        name: "",
        storageEndpoint: ""
      }]
    }
  }

  public removeIonosS3ExtensionConfig() {
    this.connector.ionosS3ExtensionConfig = null;
  }

  public addBucket() {
    if (!this.connector.ionosS3ExtensionConfig.buckets) {
      this.connector.ionosS3ExtensionConfig.buckets = []
    }
    this.connector.ionosS3ExtensionConfig.buckets.push({
      name: "",
      storageEndpoint: ""
    });
  }

  public removeBucket(index: number) {
    this.connector.ionosS3ExtensionConfig.buckets.splice(index, 1);
  }

  public customTrackBy(index: number, obj: any): any {
    return index;
  }
}
