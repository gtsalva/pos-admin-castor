import { TestBed } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NZ_I18N, es_ES } from 'ng-zorro-antd/i18n';

describe('ProductFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideAnimationsAsync(),
        { provide: NZ_I18N, useValue: es_ES },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductFormComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
