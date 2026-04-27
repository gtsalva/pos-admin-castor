import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SalesApiService } from './sales-api.service';
import { environment } from '../../../../environments/environment';

describe('SalesApiService', () => {
  let service: SalesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SalesApiService],
    });
    service = TestBed.inject(SalesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getSales calls GET /sales with query params', () => {
    service.getSales({ page: 2, limit: 10, status: 'COMPLETED' }).subscribe();
    const req = http.expectOne(r =>
      r.url === `${environment.apiUrl}/sales` &&
      r.params.get('page') === '2' &&
      r.params.get('status') === 'COMPLETED'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: { data: [], total: 0, page: 2, limit: 10 }, message: 'ok', statusCode: 200 });
  });

  it('getSale calls GET /sales/:id', () => {
    service.getSale('abc-123').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/sales/abc-123`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: {}, message: 'ok', statusCode: 200 });
  });

  it('voidSale calls PATCH /sales/:id/void with reason', () => {
    service.voidSale('abc-123', 'error de precio').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/sales/abc-123/void`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ void_reason: 'error de precio' });
    req.flush({ data: {}, message: 'ok', statusCode: 200 });
  });
});
