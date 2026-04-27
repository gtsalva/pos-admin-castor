import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClientsApiService } from '../services/clients-api.service';
import { ClientListComponent } from '../components/client-list/client-list.component';
import { Client } from '../models/client.model';

@Component({
  selector: 'app-clients-shell',
  standalone: true,
  imports: [ClientListComponent],
  templateUrl: './clients-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsShellComponent implements OnInit {
  private readonly api = inject(ClientsApiService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  readonly _clients = signal<Client[]>([]);
  readonly _total = signal(0);
  readonly _page = signal(1);
  readonly _limit = signal(20);
  readonly _search = signal('');
  readonly _loading = signal(false);

  readonly clients = this._clients.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly limit = this._limit.asReadonly();
  readonly loading = this._loading.asReadonly();

  ngOnInit(): void { this.load(); }

  load(): void {
    this._loading.set(true);
    this.api.getClients({ search: this._search() || undefined, page: this._page(), limit: this._limit() }).subscribe({
      next: (res) => { this._clients.set(res.data.data); this._total.set(res.data.total); this._loading.set(false); },
      error: () => this._loading.set(false),
    });
  }

  onSearch(search: string): void { this._search.set(search); this._page.set(1); this.load(); }
  onPageChange(page: number): void { this._page.set(page); this.load(); }
  onNew(): void { this.router.navigate(['/clientes/nuevo']); }
  onEdit(client: Client): void { this.router.navigate(['/clientes', client.client_id, 'editar']); }
  onDeactivate(client: Client): void {
    this.api.deactivateClient(client.client_id).subscribe({
      next: () => { this.message.success(`Cliente ${client.full_name} desactivado`); this.load(); },
    });
  }
}
