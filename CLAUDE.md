# CLAUDE.md — pos-admin
## Panel de Administración — Desktop

Lee primero el `CLAUDE.md` de la raíz del workspace, luego el `CLAUDE.md` de la raíz de este proyecto.
Este archivo agrega las reglas específicas de `pos-admin`.

---

## Propósito y Contexto

`pos-admin` es la herramienta de control del negocio para el gerente/administrador.
Corre en computadora de escritorio o laptop. El administrador necesita **densidad de información,
filtros potentes, exportación y trazabilidad completa** de cada operación.

**El administrador necesita control total. La app no simplifica — expone todo.**

---

## Desktop First — Reglas de Diseño

1. **Layout con sidebar fijo** de 240px + área de contenido.
2. **Tablas densas** con `nz-table` — paginación, ordenamiento por columna, filtros inline.
3. **Todo detalle y formulario en su propia ruta** — `/<módulo>/:id`, `/<módulo>/:id/editar`, `/<módulo>/nuevo`. Nunca `nz-drawer` ni `nz-modal` para navegar a contenido o mostrar detalles. Un detalle = una URL.
4. **`nz-modal` y `nz-popconfirm` solo para acciones destructivas** — confirmación de anulación, eliminación, cierre de turno. Son acciones, no vistas de contenido.
5. **Acciones en bulk** — checkboxes en tablas, acciones en grupo (ej: ajustar stock de N productos).
6. **Exportación a Excel/PDF** en todos los reportes.
7. **Dashboard visible al entrar** — métricas del día sin necesidad de navegar.
8. **Breadcrumbs** en todas las secciones profundas.

---

## Módulos y Pantallas

### Dashboard (`/dashboard`)
- Ventas del día: total, cantidad de transacciones, ticket promedio
- Top 5 vendedores del día
- Alertas de stock mínimo (productos críticos)
- Acceso rápido a cierre de turno pendiente

### Productos
- `/productos` — tabla con filtros: categoría, estado, stock
- `/productos/nuevo` — formulario de alta
- `/productos/:id` — detalle del producto (info, stock, movimientos recientes)
- `/productos/:id/editar` — formulario de edición
- Carga masiva via CSV (sprint 2+)

### Inventario
- `/inventario` — tabla de stock actual con alertas de mínimo
- `/inventario/:productId` — detalle: stock actual, historial de movimientos, formulario de ajuste manual

### Compras
- `/compras` — listado de órdenes (PENDIENTE, RECIBIDA, CANCELADA)
- `/compras/nueva` — flujo en `nz-steps`: crear orden → agregar ítems → confirmar
- `/compras/:id` — detalle de la orden (ítems, proveedor, estado, timeline)
- `/compras/:id/recibir` — pantalla de recepción de mercadería
- `/proveedores` — lista de proveedores
- `/proveedores/nuevo` · `/proveedores/:id` · `/proveedores/:id/editar`

### Ventas
- `/ventas` — historial con filtros por fecha, vendedor, método de pago
- `/ventas/:id` — detalle: ítems, subtotales, vendedor, cajero, estado
- Anulación desde `/ventas/:id` con `nz-modal` de confirmación + motivo
- `/ventas/cierre` — pantalla de cierre de turno con resumen

### Incentivos
- `/incentivos` — metas activas y tabla de progreso por vendedor
- `/incentivos/nueva-meta` — formulario de nueva meta/período
- `/incentivos/:id` — detalle del período: vendedores, progreso, comisiones calculadas
- `/incentivos/:id/liquidar` — pantalla de liquidación con confirmación

### Reportes
- `/reportes/ventas` — ventas por período (diario, semanal, mensual) — gráficas + tabla + exportar
- `/reportes/inventario` — rotación: productos más/menos vendidos
- `/reportes/vendedores` — desempeño y comisiones por vendedor
- Exportación a Excel (xlsx) y PDF en cada reporte

### Usuarios
- `/usuarios` — lista de usuarios con rol y estado
- `/usuarios/nuevo` — formulario de alta
- `/usuarios/:id` — detalle: info, rol, historial de sesiones
- `/usuarios/:id/editar` — formulario de edición

### Auditoría
- `/auditoria` — log de todas las operaciones (solo lectura)
- `/auditoria/:id` — detalle de un registro de auditoría
- Filtros: usuario, acción, entidad, rango de fechas + exportar

---

## Estructura del Proyecto

```
pos-admin/src/app/
  ├── core/
  │   ├── guards/
  │   │   ├── auth.guard.ts
  │   │   └── admin-role.guard.ts      ← solo ADMIN y MANAGER
  │   ├── interceptors/
  │   │   ├── auth.interceptor.ts
  │   │   └── error.interceptor.ts
  │   └── services/
  │       ├── auth.service.ts
  │       └── session.service.ts
  │
  ├── shared/
  │   ├── components/
  │   │   ├── page-header/             ← título + breadcrumb + acciones
  │   │   ├── data-table/              ← wrapper sobre nz-table con config
  │   │   ├── confirm-modal/           ← modal de confirmación genérico
  │   │   ├── status-tag/              ← nz-tag con colores por estado
  │   │   └── export-button/           ← botón con opciones Excel/PDF
  │   ├── directives/
  │   │   └── has-role.directive.ts    ← *hasRole="['ADMIN']"
  │   └── models/
  │       ├── pagination.model.ts
  │       ├── table-filter.model.ts
  │       └── index.ts
  │
  ├── features/
  │   ├── auth/
  │   ├── dashboard/
  │   ├── products/
  │   ├── inventory/
  │   ├── purchases/
  │   ├── sales/
  │   ├── incentives/
  │   ├── reports/
  │   ├── users/
  │   └── audit/
  │
  ├── layout/
  │   ├── sidebar/                     ← nz-menu lateral con secciones
  │   ├── header/                      ← usuario, notificaciones, logout
  │   └── admin-shell/                 ← layout principal con sidebar + header
  │
  ├── app.component.ts
  ├── app.config.ts
  └── app.routes.ts
```

### Estructura de un Feature en pos-admin

Cada ruta tiene su propio componente Smart. Los componentes Dumb son de presentación pura.

```
features/inventory/
  ├── components/
  │   ├── stock-table/               ← tabla de stock (Dumb)
  │   ├── stock-detail-card/         ← info del producto (Dumb)
  │   ├── movement-history/          ← historial de movimientos (Dumb)
  │   ├── adjustment-form/           ← formulario de ajuste (Dumb)
  │   └── low-stock-alert/           ← banner de alertas (Dumb)
  ├── models/
  │   ├── stock.model.ts             ← { product_id, stock, min_stock, ... }
  │   ├── movement.model.ts          ← { movement_id, product_id, quantity, ... }
  │   └── index.ts
  ├── services/
  │   ├── inventory-api.service.ts
  │   └── inventory-state.service.ts
  ├── inventory-list/                ← Smart: ruta /inventario
  ├── inventory-detail/              ← Smart: ruta /inventario/:productId
  └── inventory.routes.ts
```

```typescript
// inventory.routes.ts
export const inventoryRoutes: Routes = [
  {
    path: '',
    component: InventoryListComponent,
    providers: [InventoryStateService],
  },
  {
    path: ':productId',
    component: InventoryDetailComponent,
  },
];
```

---

## NG Zorro — Componentes Clave

```typescript
// Importar solo lo necesario
import { NzTableModule }      from 'ng-zorro-antd/table';
import { NzFormModule }       from 'ng-zorro-antd/form';
import { NzSelectModule }     from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule }     from 'ng-zorro-antd/drawer';
import { NzModalModule }      from 'ng-zorro-antd/modal';
import { NzStepsModule }      from 'ng-zorro-antd/steps';
import { NzStatisticModule }  from 'ng-zorro-antd/statistic';
import { NzProgressModule }   from 'ng-zorro-antd/progress';
import { NzTimelineModule }   from 'ng-zorro-antd/timeline';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule }       from 'ng-zorro-antd/card';
import { NzTabsModule }       from 'ng-zorro-antd/tabs';
import { NzDividerModule }    from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'; // confirmación inline
import { NzTagModule }        from 'ng-zorro-antd/tag';
import { NzBadgeModule }      from 'ng-zorro-antd/badge';
import { NzAlertModule }      from 'ng-zorro-antd/alert';
import { NzMessageModule }    from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification'; // alertas stock
```

### Patrones específicos de pos-admin

**Tabla estándar con paginación del servidor:**
```html
<nz-table #table
  [nzData]="items()"
  [nzTotal]="total()"
  [nzPageSize]="pageSize()"
  [nzPageIndex]="pageIndex()"
  [nzLoading]="isLoading()"
  nzShowSizeChanger
  (nzPageIndexChange)="onPageChange($event)"
  (nzPageSizeChange)="onPageSizeChange($event)">
  <thead>
    <tr>
      <th nzColumnKey="name" [nzSortFn]="true">Producto</th>
      <th nzColumnKey="stock" [nzSortFn]="true">Stock</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    @for (row of table.data; track row.id) {
      <tr>
        <td>{{ row.name }}</td>
        <td>
          <nz-tag [nzColor]="row.stock <= row.minStock ? 'red' : 'green'">
            {{ row.stock }}
          </nz-tag>
        </td>
        <td>
          <button nz-button nzType="link" (click)="openAdjustment(row)">Ajustar</button>
          <nz-divider nzType="vertical"/>
          <button nz-button nzType="link" (click)="viewHistory(row)">Historial</button>
        </td>
      </tr>
    }
  </tbody>
</nz-table>
```

**Confirmación de acción destructiva (anulación de venta):**
```html
<button nz-button nzType="link" nzDanger
  nz-popconfirm
  nzPopconfirmTitle="¿Anular esta venta?"
  nzPopconfirmPlacement="left"
  (nzOnConfirm)="voidSale(sale.id)">
  Anular
</button>
```

**Formulario en su propia ruta (alta/edición de producto):**
```typescript
// products.routes.ts
export const productRoutes: Routes = [
  { path: '',          component: ProductListComponent },
  { path: 'nuevo',     component: ProductFormComponent },
  { path: ':id',       component: ProductDetailComponent },
  { path: ':id/editar', component: ProductFormComponent },
];

// product-form.component.ts — detecta si es alta o edición por la ruta
readonly productId = input<string | undefined>();   // undefined = alta

ngOnInit() {
  if (this.productId()) {
    this.loadProduct(this.productId()!);
  }
}
```

**Formularios — siempre ReactiveFormsModule:**
```typescript
// En componente Dumb de formulario
productForm = this.fb.group({
  name:        ['', [Validators.required, Validators.maxLength(100)]],
  sku:         ['', [Validators.required]],
  price:       [0,  [Validators.required, Validators.min(0.01)]],
  categoryId:  ['', [Validators.required]],
  description: [''],
});
```

---

## Directiva hasRole

Para mostrar/ocultar elementos según el rol del usuario autenticado:

```typescript
// shared/directives/has-role.directive.ts
@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly authService = inject(AuthService);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);

  @Input() set hasRole(roles: UserRole[]) {
    const userRole = this.authService.currentUser()?.role;
    if (userRole && roles.includes(userRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

// Uso en template
<button *hasRole="['ADMIN']" nz-button nzDanger>Eliminar usuario</button>
```

---

## Gestión de Estado en pos-admin

Para features complejos con filtros, paginación y múltiples acciones, usar un servicio de estado dedicado:

```typescript
@Injectable()   // ← providedIn: 'root' NO — se provee en el módulo del feature
export class InventoryStateService {
  // Filtros
  private readonly _filters = signal<InventoryFilters>({ page: 1, limit: 20 });
  private readonly _isLoading = signal(false);
  private readonly _items = signal<StockItem[]>([]);
  private readonly _total = signal(0);

  // Drawer
  private readonly _selectedItem = signal<StockItem | null>(null);
  private readonly _drawerVisible = signal(false);

  readonly filters       = this._filters.asReadonly();
  readonly isLoading     = this._isLoading.asReadonly();
  readonly items         = this._items.asReadonly();
  readonly total         = this._total.asReadonly();
  readonly selectedItem  = this._selectedItem.asReadonly();
  readonly drawerVisible = this._drawerVisible.asReadonly();

  readonly lowStockCount = computed(
    () => this._items().filter(i => i.stock <= i.minStock).length
  );

  openAdjustment(item: StockItem): void {
    this._selectedItem.set(item);
    this._drawerVisible.set(true);
  }

  closeDrawer(): void {
    this._drawerVisible.set(false);
    this._selectedItem.set(null);
  }
}
```

**Nota importante:** Los servicios de estado de features en pos-admin se proveen en el propio feature route (`providers: [InventoryStateService]`), no en `root`. Esto evita que el estado de inventario persista al navegar a otra sección.

```typescript
// inventory.routes.ts
export const inventoryRoutes: Routes = [{
  path: '',
  component: InventoryShellComponent,
  providers: [InventoryStateService],   // ← estado scoped al feature
}];
```

## Signals Naming

- Privados: `_camelCase`
- Públicos: `snake_case`
---

## Reglas Específicas de pos-admin

| Regla | Descripción |
|-------|-------------|
| **Todo detalle en su propia ruta** | Cualquier detalle, por mínimo que sea, tiene su propia ruta. Nunca `nz-drawer` ni `nz-modal` para mostrar contenido |
| **Modal/popconfirm solo para acciones** | `nz-modal` y `nz-popconfirm` exclusivamente para confirmar acciones destructivas (anular, eliminar, cerrar turno) |
| **`snake_case` en propiedades** | Toda propiedad de modelo/interface usa `snake_case`: `product_id`, `unit_price`, `created_at` |
| **`PascalCase` en clases e interfaces** | `Product`, `SaleItem`, `InventoryMovement`, `CreateProductDto` |
| **Cero `any`** | No `any` en ningún archivo. Crear el tipo/interface si no existe |
| **ReactiveFormsModule siempre** | Todos los formularios usan `FormGroup` y `FormControl` — nunca `ngModel` |
| **Paginación del servidor** | Nunca cargar todos los registros. Siempre paginar en el backend |
| **Estado de feature scoped** | Servicios de estado se proveen en la ruta del feature, no en root |
| **Exportación en todos los reportes** | Botón de exportación Excel obligatorio en cada reporte |
| **Auditoría automática** | El backend registra toda operación. El admin solo consulta, no puede borrar el log |
| **Alertas de stock en tiempo real** | Al entrar al dashboard, consultar productos con stock ≤ mínimo |
| **Cierre de turno con confirmación doble** | Modal de resumen primero → `nz-popconfirm` para confirmar — operación irreversible |
| **Responsive mínimo en 1024px** | Diseñar para 1280px, soportar 1024px. No se requiere mobile |
| **Números con locale gt** | `{{ monto | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}` |

---

## Inicialización del Proyecto

### Prerequisitos
- Node 20 LTS (`node -v` → `v20.x.x`)
- Angular CLI 19: `npm install -g @angular/cli@19`

### Crear el proyecto (solo primera vez)
```bash
# Desde la raíz del workspace
ng new pos-admin \
  --routing \
  --style=less \
  --strict \
  --standalone \
  --ssr=false \
  --skip-git
cd pos-admin
```

### Instalar NG Zorro 19
```bash
ng add ng-zorro-antd@19
# Cuando pregunte:
#   Icon style?           → outline
#   Set up custom theme?  → Yes
#   Enable all Components?→ No
#   Template?             → side   ← genera sidebar listo para desktop
#   Locale?               → es_ES
```

### `src/app/app.config.ts`
```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { es_ES, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

registerLocaleData(es);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(NzMessageModule, NzNotificationModule),
    { provide: NZ_I18N, useValue: es_ES },
    { provide: LOCALE_ID, useValue: 'es-GT' },
  ],
};
```

### `src/app/app.routes.ts`
```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminRoleGuard } from './core/guards/admin-role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard, adminRoleGuard],
    loadComponent: () =>
      import('./layout/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('./features/products/products.routes').then(m => m.productRoutes),
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then(m => m.inventoryRoutes),
      },
      {
        path: 'ventas',
        loadChildren: () =>
          import('./features/sales/sales.routes').then(m => m.salesRoutes),
      },
      {
        path: 'compras',
        loadChildren: () =>
          import('./features/purchases/purchases.routes').then(m => m.purchaseRoutes),
      },
      {
        path: 'incentivos',
        loadChildren: () =>
          import('./features/incentives/incentives.routes').then(m => m.incentiveRoutes),
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(m => m.reportRoutes),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/users/users.routes').then(m => m.userRoutes),
      },
      {
        path: 'auditoria',
        loadChildren: () =>
          import('./features/audit/audit.routes').then(m => m.auditRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
```

### `src/app/core/interceptors/auth.interceptor.ts`
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  if (!token) return next(req);
  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};
```

### `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
};
```

### `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://pos-api.railway.app/api',
};
```

### Levantar en desarrollo
```bash
ng serve --port 4201   # http://localhost:4201
```

---

## Gotchas Conocidos

| # | Gotcha | Fix |
|---|--------|-----|
| 1 | **TransformInterceptor double-wrap** — Respuestas paginadas llegan como `{ data: { data: T[], total, page, limit }, message, statusCode }`. El `total` NO está en la raíz. | Usar `ApiPaginatedResponse<T>` con `data: PaginatedResult<T>` y mapear `res.data`. |
| 2 | **JWT sin `name`** — Si el backend no incluye `name` en el payload, `restoreUserFromToken()` no puede reconstruir `full_name` en refresh de página. | `JwtStrategy.validate()` debe retornar `name: user.full_name`. |
| 3 | **Puerto 3000 ocupado** — `kama-platform-backend` corre en Docker en el 3000. `pos-api` usa el 3001. | `environment.ts` y `.env` deben apuntar a `localhost:3001`. |

### Git (repositorio propio de pos-admin)
```bash
git init
git add .
git commit -m "chore: initial Angular 19 scaffold"
```