import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => http.verify());

  it('isLoggedIn is false initially', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('login stores token and updates user signal', () => {
    const mockRes = {
      data: {
        access_token: 'tok999',
        user: { user_id: '2', email: 'gerente@castor.gt', full_name: 'Gerente', role: 'MANAGER' },
      },
    };
    service.login('gerente@castor.gt', 'pass').subscribe();
    const req = http.expectOne('http://localhost:3000/api/auth/login');
    req.flush(mockRes);
    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.role).toBe('MANAGER');
  });

  it('logout clears state', () => {
    sessionStorage.setItem('access_token', 'tok');
    service['_token'].set('tok');
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('access_token')).toBeNull();
  });
});
