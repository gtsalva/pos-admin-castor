import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Client, CreateClientPayload, UpdateClientPayload } from '../models/client.model';

interface ApiResponse<T> { data: T; message: string; statusCode: number; }
interface PaginatedResult<T> { data: T[]; total: number; page: number; limit: number; }

@Injectable({ providedIn: 'root' })
export class ClientsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/clients`;

  getClients(params?: { search?: string; page?: number; limit?: number }) {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));
    return this.http.get<ApiResponse<PaginatedResult<Client>>>(this.base, { params: httpParams });
  }

  getClient(client_id: string) {
    return this.http.get<ApiResponse<Client>>(`${this.base}/${client_id}`);
  }

  createClient(payload: CreateClientPayload) {
    return this.http.post<ApiResponse<Client>>(this.base, payload);
  }

  updateClient(client_id: string, payload: UpdateClientPayload) {
    return this.http.patch<ApiResponse<Client>>(`${this.base}/${client_id}`, payload);
  }

  deactivateClient(client_id: string) {
    return this.http.delete(`${this.base}/${client_id}`);
  }

  uploadPhoto(client_id: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.patch<{ data: import('../models/client.model').Client; message: string; statusCode: number }>(`${this.base}/${client_id}/photo`, fd);
  }

  removePhoto(client_id: string) {
    return this.http.delete<{ data: import('../models/client.model').Client; message: string; statusCode: number }>(`${this.base}/${client_id}/photo`);
  }
}
