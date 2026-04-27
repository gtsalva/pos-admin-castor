import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InventoryApiService } from './inventory-api.service';
import { environment } from '../../../../environments/environment';

describe('InventoryApiService', () => {
  let service: InventoryApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), InventoryApiService],
    });
    service = TestBed.inject(InventoryApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getInventory calls GET /inventory', () => {
    service.getInventory({ page: 1, limit: 20 }).subscribe();
    const req = http.expectOne(r => r.url === `${environment.apiUrl}/inventory`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: { data: [], total: 0, page: 1, limit: 20 }, message: 'ok', statusCode: 200 });
  });

  it('getInventory with low_stock filter includes param', () => {
    service.getInventory({ low_stock: true }).subscribe();
    const req = http.expectOne(r =>
      r.url === `${environment.apiUrl}/inventory` &&
      r.params.get('low_stock') === 'true'
    );
    req.flush({ data: { data: [], total: 0, page: 1, limit: 20 }, message: 'ok', statusCode: 200 });
  });

  it('getMovements calls GET /inventory/:id/movements', () => {
    service.getMovements('product-uuid').subscribe();
    const req = http.expectOne(r =>
      r.url === `${environment.apiUrl}/inventory/product-uuid/movements`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: { data: [], total: 0, page: 1, limit: 20 }, message: 'ok', statusCode: 200 });
  });

  it('adjustStock calls POST /inventory/adjust', () => {
    const payload = { product_id: 'p1', movement_type: 'IN' as const, quantity: 10 };
    service.adjustStock(payload).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/inventory/adjust`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ data: {}, message: 'ok', statusCode: 201 });
  });
});
