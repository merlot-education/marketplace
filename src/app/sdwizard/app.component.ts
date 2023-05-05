import {Component} from '@angular/core';
import {FilesProvider} from '@shared/files-provider';
import { I18nModule } from './i18n/i18n.module';
import { TranslateService } from '@ngx-translate/core';
import { IconSetService } from '@coreui/icons-angular';
import { brandSet, flagSet, freeSet } from '@coreui/icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Validate Instance Creator';
  hasStaticFiles = false;

  constructor(filesProvider: FilesProvider,public translate: TranslateService, private iconSetService: IconSetService) {
    
    this.hasStaticFiles = filesProvider.gethasStaticFiles();
    // iconSet singleton
    iconSetService.icons = { ...freeSet, ...flagSet, ...brandSet };

  }

}

