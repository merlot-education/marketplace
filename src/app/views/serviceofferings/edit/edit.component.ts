import { Component, OnInit } from '@angular/core';
import { IOfferings } from '../serviceofferings-data';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  constructor(protected authService : AuthService) {
  }

  ngOnInit(): void {
    console.log(this.authService.activeOrganizationRole.value.orgaRoleString);
  }
}
