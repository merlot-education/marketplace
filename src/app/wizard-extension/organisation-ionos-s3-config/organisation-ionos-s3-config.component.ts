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
