import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="ph">
      <div class="ph__main">
        @if (breadcrumbs?.length) {
          <nav class="ph__crumbs">
            @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
              @if (crumb.route && !last) {
                <a [routerLink]="crumb.route">{{ crumb.label }}</a>
                <span class="ph__sep">/</span>
              } @else {
                <span>{{ crumb.label }}</span>
              }
            }
          </nav>
        }
        <h1 class="ph__title">{{ title }}</h1>
        @if (subtitle) {
          <p class="ph__sub">{{ subtitle }}</p>
        }
      </div>
      <div class="ph__actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: [`
    .ph {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 1px solid #EDE0D4;
      margin-bottom: 24px;
    }

    .ph__main {
      border-left: 3px solid #C85A1A;
      padding-left: 12px;
    }

    .ph__crumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #8C7B75;
      margin-bottom: 4px;
    }

    .ph__crumbs a {
      color: #8C7B75;
      text-decoration: none;
      transition: color 0.15s;
    }

    .ph__crumbs a:hover { color: #C85A1A; }

    .ph__sep { color: #C4B0A3; font-size: 11px; }

    .ph__title {
      font-size: 22px;
      font-weight: 700;
      color: #1A1614;
      margin: 0;
      line-height: 1.25;
    }

    .ph__sub {
      font-size: 13px;
      color: #8C7B75;
      margin: 4px 0 0;
    }

    .ph__actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
  `],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs?: Breadcrumb[];
}
