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
import { isLegalParticipantCs, asLegalParticipantCs, isLegalRegistrationNumberCs, asLegalRegistrationNumberCs, 
  isMerlotLegalParticipantCs, asMerlotLegalParticipantCs } from 'src/app/utils/credential-tools';
import { IOrganizationData } from '../../organization/organization-data';

@Component({
  selector: 'app-organisationdetailview',
  templateUrl: './organisationdetailview.component.html',
  styleUrls: ['./organisationdetailview.component.scss']
})
export class OrganisationdetailviewComponent {
  @Input() protected organisationData: IOrganizationData;

  protected isLegalParticipantCs = isLegalParticipantCs;
  protected asLegalParticipantCs = asLegalParticipantCs;
  protected isLegalRegistrationNumberCs = isLegalRegistrationNumberCs;
  protected asLegalRegistrationNumberCs = asLegalRegistrationNumberCs;
  protected isMerlotLegalParticipantCs = isMerlotLegalParticipantCs;
  protected asMerlotLegalParticipantCs = asMerlotLegalParticipantCs;

  constructor() {
  }

}
