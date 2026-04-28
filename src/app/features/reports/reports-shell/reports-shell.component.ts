import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-reports-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NzIconModule],
  template: `
    <div class="reports-header">
      <h2 style="margin:0;font-size:22px;font-weight:700;color:#1A1614">Reportes</h2>
      <p style="margin:4px 0 16px;color:#8C7B75;font-size:13px">
        Analítica del negocio — últimos 30 días por defecto
      </p>
    </div>

    <div class="report-tabs">
      <a routerLink="vendedores" routerLinkActive="active-tab" class="report-tab">
        <span nz-icon nzType="trophy"></span> Mejores vendedores
      </a>
      <a routerLink="productos" routerLinkActive="active-tab" class="report-tab">
        <span nz-icon nzType="shopping"></span> Productos más vendidos
      </a>
      <a routerLink="margenes" routerLinkActive="active-tab" class="report-tab">
        <span nz-icon nzType="rise"></span> Rendimiento precio-costo
      </a>
      <a routerLink="ingresos" routerLinkActive="active-tab" class="report-tab">
        <span nz-icon nzType="bar-chart"></span> Ingresos
      </a>
    </div>

    <div class="reports-content">
      <router-outlet />
    </div>
  `,
  styles: [`
    .reports-header { margin-bottom: 8px; }
    .report-tabs {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid #EDE0D4;
      margin-bottom: 20px;
      padding-bottom: 0;
    }
    .report-tab {
      padding: 8px 16px;
      border-radius: 8px 8px 0 0;
      font-size: 14px;
      font-weight: 500;
      color: #8C7B75;
      text-decoration: none;
      border: 1px solid transparent;
      border-bottom: none;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .report-tab:hover { color: #C85A1A; background: rgba(200,90,26,0.04); }
    .active-tab {
      color: #C85A1A;
      background: #fff;
      border-color: #EDE0D4;
      border-bottom-color: #fff;
      margin-bottom: -1px;
    }
  `],
})
export class ReportsShellComponent {}
