import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent, NavGroup } from '../sidebar/sidebar.component';
import { StoreSettingsService } from '../../shared/services/store-settings.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    NzLayoutModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzMenuModule,
    SidebarComponent,
  ],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.less',
})
export class AdminShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly storeSettings = inject(StoreSettingsService);

  readonly currentUser = this.auth.currentUser;
  readonly store_name = this.storeSettings.store_name;

  readonly avatarInitials = computed(() => {
    const name = this.currentUser()?.full_name ?? '';
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  });

  readonly navGroups: NavGroup[] = [
    {
      label: 'Ventas',
      items: [
        { label: 'Reportes', icon: 'bar-chart', route: '/reportes' },
        { label: 'Ventas', icon: 'transaction', route: '/ventas' },
        { label: 'Cotizaciones', icon: 'file-text', route: '/cotizaciones' },
        { label: 'Cierres', icon: 'lock', route: '/cierres' },
      ],
    },
    {
      label: 'Catálogo',
      items: [
        { label: 'Productos', icon: 'shopping', route: '/productos' },
        { label: 'Categorías', icon: 'appstore', route: '/categorias' },
        { label: 'Inventario', icon: 'database', route: '/inventario' },
        { label: 'Clientes', icon: 'contacts', route: '/clientes' },
      ],
    },
    {
      label: 'Compras',
      items: [
        { label: 'Compras', icon: 'shopping-cart', route: '/compras' },
        { label: 'Proveedores', icon: 'shop', route: '/proveedores' },
      ],
    },
    {
      label: 'Equipo',
      items: [
        { label: 'Incentivos', icon: 'trophy', route: '/incentivos' },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { label: 'Usuarios', icon: 'user', route: '/usuarios' },
        { label: 'Auditoría', icon: 'file-search', route: '/auditoria' },
        { label: 'Configuración', icon: 'setting', route: '/configuracion' },
      ],
    },
  ];

  goToPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
