import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface SettingsData {
  store_name: string;
  setting_id: number;
  updated_at: string;
  min_price_margin: number;
  sale_price_margin: number;
}

interface SettingsApiResponse {
  data: SettingsData;
}

interface UpdateSettingsDto {
  store_name: string;
  min_price_margin?: number;
  sale_price_margin?: number;
}

@Injectable({ providedIn: 'root' })
export class StoreSettingsService {
  private readonly http = inject(HttpClient);
  private readonly _store_name = signal('Mueblería El Castor');
  private readonly _min_price_margin = signal(20);
  private readonly _sale_price_margin = signal(35);

  readonly store_name = this._store_name.asReadonly();
  readonly min_price_margin = this._min_price_margin.asReadonly();
  readonly sale_price_margin = this._sale_price_margin.asReadonly();

  async load(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<SettingsApiResponse>(`${environment.apiUrl}/settings`),
      );
      this._store_name.set(res.data.store_name);
      this._min_price_margin.set(Number(res.data.min_price_margin));
      this._sale_price_margin.set(Number(res.data.sale_price_margin));
    } catch {
      // defaults preserved
    }
  }

  async update(dto: UpdateSettingsDto): Promise<void> {
    const res = await firstValueFrom(
      this.http.patch<SettingsApiResponse>(`${environment.apiUrl}/settings`, dto),
    );
    this._store_name.set(res.data.store_name);
    this._min_price_margin.set(Number(res.data.min_price_margin));
    this._sale_price_margin.set(Number(res.data.sale_price_margin));
  }
}
