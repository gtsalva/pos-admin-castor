import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';

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

  readonly currentUser = this.auth.currentUser;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Productos', icon: 'shopping', route: '/productos' },
    { label: 'Clientes', icon: 'team', route: '/clientes' },
    { label: 'Ventas', icon: 'transaction', route: '/ventas' },
    { label: 'Inventario', icon: 'database', route: '/inventario' },
    { label: 'Compras', icon: 'shopping-cart', route: '/compras' },
    { label: 'Incentivos', icon: 'trophy', route: '/incentivos' },
    { label: 'Reportes', icon: 'bar-chart', route: '/reportes' },
    { label: 'Proveedores', icon: 'team', route: '/proveedores' },
    { label: 'Categorías', icon: 'appstore', route: '/categorias' },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
