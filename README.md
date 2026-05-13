# pos-admin

Panel de administración para Mueblería El Castor. Diseñado para desktop, orientado al gerente con acceso completo al negocio.

**Stack:** Angular 19 · NG Zorro · TypeScript

## Funcionalidades

- Dashboard con métricas del día
- Gestión de productos, categorías e inventario
- Historial de ventas y anulaciones
- Órdenes de compra y proveedores
- Incentivos y comisiones por vendedor
- Reportes exportables
- Gestión de usuarios y auditoría

## Desarrollo local

```bash
npm install
ng serve --port 4201     # http://localhost:4201
```

La API se consume desde `http://localhost:3001/api` en desarrollo.

## Deploy

Cada push a `main` dispara un deploy automático a Cloudflare Pages vía GitHub Actions.
