import { Component } from '@angular/core';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NzStatisticModule, NzCardModule, NzGridModule],
  template: `
    <div class="dashboard">
      <h2>Dashboard</h2>
      <nz-row [nzGutter]="16">
        <nz-col [nzSpan]="6">
          <nz-card>
            <nz-statistic nzTitle="Ventas hoy" [nzValue]="0" nzPrefix="Q" />
          </nz-card>
        </nz-col>
        <nz-col [nzSpan]="6">
          <nz-card>
            <nz-statistic nzTitle="Transacciones" [nzValue]="0" />
          </nz-card>
        </nz-col>
      </nz-row>
    </div>
  `,
  styles: ['.dashboard { padding: 24px; }'],
})
export class DashboardComponent {}
