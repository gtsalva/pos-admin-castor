import { Component, OnInit, inject } from '@angular/core';
import { ProductsStateService } from '../services/products-state.service';
import { ProductListComponent } from '../components/product-list/product-list.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-products-shell',
  standalone: true,
  imports: [ProductListComponent],
  providers: [ProductsStateService],
  template: `
    <div class="products-page">
      <app-product-list
        [items]="state.items()"
        [total]="state.total()"
        [isLoading]="state.isLoading()"
        [pageIndex]="state.params().page"
        [pageSize]="state.params().limit"
        [isAdmin]="auth.currentUser()?.role === 'ADMIN'"
        (pageChange)="state.setPage($event)"
        (pageSizeChange)="state.setPageSize($event)"
        (search)="state.search($event)"
        (delete)="state.delete($event)"
      />
    </div>
  `,
})
export class ProductsShellComponent implements OnInit {
  readonly state = inject(ProductsStateService);
  readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.state.load();
  }
}
