import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClientsApiService } from '../../services/clients-api.service';
import { CreateClientPayload, UpdateClientPayload } from '../../models/client.model';
import {
  DEPARTAMENTOS_GUATEMALA,
  DEFAULT_DEPARTAMENTO,
  DEFAULT_MUNICIPIO,
  getMunicipios,
} from '../../../../shared/data/guatemala-locations';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzCardModule, NzGridModule, NzSelectModule],
  templateUrl: './client-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFormComponent implements OnInit {
  private readonly api = inject(ClientsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  readonly isEdit = signal(false);
  readonly loading = signal(false);
  private clientId: string | null = null;

  readonly departamentos = DEPARTAMENTOS_GUATEMALA;
  readonly currentMunicipios = signal<string[]>(getMunicipios(DEFAULT_DEPARTAMENTO));

  form = new FormGroup({
    full_name: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    nit: new FormControl('', [Validators.maxLength(20)]),
    dpi: new FormControl('', [Validators.maxLength(20)]),
    business_name: new FormControl('', [Validators.maxLength(200)]),
    email: new FormControl('', [Validators.email]),
    phone: new FormControl('', [Validators.maxLength(20)]),
    billing_address: new FormControl('', [Validators.maxLength(300)]),
    billing_department: new FormControl(DEFAULT_DEPARTAMENTO, [Validators.maxLength(100)]),
    billing_city: new FormControl(DEFAULT_MUNICIPIO, [Validators.maxLength(100)]),
  });

  ngOnInit(): void {
    this.form.get('billing_department')!.valueChanges.subscribe(dept => {
      const municipios = getMunicipios(dept ?? '');
      this.currentMunicipios.set(municipios);
      this.form.get('billing_city')!.setValue(municipios[0] ?? '', { emitEvent: false });
    });

    this.clientId = this.route.snapshot.paramMap.get('client_id');
    if (this.clientId) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.api.getClient(this.clientId).subscribe({
        next: (res) => {
          this.form.patchValue(res.data, { emitEvent: false });
          const dept = res.data.billing_department ?? DEFAULT_DEPARTAMENTO;
          this.currentMunicipios.set(getMunicipios(dept));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => { c.markAsDirty(); c.updateValueAndValidity({ onlySelf: true }); });
      return;
    }
    const payload = Object.fromEntries(
      Object.entries(this.form.value).filter(([, v]) => v !== '' && v != null)
    ) as Record<string, string>;

    this.loading.set(true);
    const req = this.isEdit()
      ? this.api.updateClient(this.clientId!, payload as unknown as UpdateClientPayload)
      : this.api.createClient(payload as unknown as CreateClientPayload);
    req.subscribe({
      next: () => { this.message.success(this.isEdit() ? 'Cliente actualizado' : 'Cliente creado'); this.router.navigate(['/clientes']); },
      error: () => this.loading.set(false),
    });
  }

  cancel(): void { this.router.navigate(['/clientes']); }
}
