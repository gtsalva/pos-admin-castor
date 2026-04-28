import { Component, input } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [NzCardModule, NzStatisticModule],
  template: `
    <nz-card class="kpi-card" [style.border-top]="'3px solid ' + accentColor()">
      <nz-statistic
        [nzTitle]="label()"
        [nzValue]="value()"
        [nzPrefix]="prefix()"
        [nzSuffix]="suffix()"
        [nzValueStyle]="{ color: accentColor(), fontSize: '24px', fontWeight: '700' }"
      />
      @if (sub()) {
        <p class="kpi-sub">{{ sub() }}</p>
      }
    </nz-card>
  `,
  styles: [`
    .kpi-card { border-radius: 12px; }
    .kpi-sub { margin: 4px 0 0; font-size: 12px; color: #8C7B75; }
  `],
})
export class KpiCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  prefix = input<string>('');
  suffix = input<string>('');
  sub = input<string>('');
  accentColor = input<string>('#C85A1A');
}
