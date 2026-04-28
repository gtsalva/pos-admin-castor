import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NZ_I18N, es_ES } from 'ng-zorro-antd/i18n';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  AppstoreOutline,
  CheckCircleFill,
  CheckCircleOutline,
  CloseCircleFill,
  CloseCircleOutline,
  CloseOutline,
  DashboardOutline,
  DatabaseOutline,
  DeleteOutline,
  DownOutline,
  EditOutline,
  ExclamationCircleFill,
  FilePdfOutline,
  InfoCircleFill,
  InboxOutline,
  LoadingOutline,
  LockOutline,
  LogoutOutline,
  MailOutline,
  PlusOutline,
  SearchOutline,
  PictureOutline,
  ShoppingCartOutline,
  StarFill,
  StarOutline,
  ShoppingOutline,
  TeamOutline,
  TransactionOutline,
  UpOutline,
  UserOutline,
  WarningFill,
} from '@ant-design/icons-angular/icons';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(NzMessageModule, NzModalModule, NzNotificationModule),
    provideNzIcons([
      AppstoreOutline,
      CheckCircleFill,
      CheckCircleOutline,
      CloseCircleFill,
      CloseCircleOutline,
      CloseOutline,
      DashboardOutline,
      DatabaseOutline,
      DeleteOutline,
      DownOutline,
      EditOutline,
      ExclamationCircleFill,
      FilePdfOutline,
      InfoCircleFill,
      InboxOutline,
      LoadingOutline,
      LockOutline,
      LogoutOutline,
      MailOutline,
      PictureOutline,
      PlusOutline,
      SearchOutline,
      ShoppingCartOutline,
      ShoppingOutline,
      StarFill,
      StarOutline,
      TeamOutline,
      TransactionOutline,
      UpOutline,
      UserOutline,
      WarningFill,
    ]),
    { provide: NZ_I18N, useValue: es_ES },
    { provide: LOCALE_ID, useValue: 'es-GT' },
  ],
};
