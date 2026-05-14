import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { QuetzalesPipe } from '../../../../shared/pipes/quetzales.pipe';
import { Product } from '../../../../shared/models/product.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, NzTableModule, NzTagModule, NzInputModule, NzButtonModule, NzIconModule, NzAvatarModule, NzPopconfirmModule, NzDividerModule, QuetzalesPipe, PageHeaderComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.less',
})
export class ProductListComponent {
  readonly items = input<Product[]>([]);
  readonly total = input(0);
  readonly isLoading = input(false);
  readonly pageIndex = input(1);
  readonly pageSize = input(20);
  readonly isAdmin = input(false);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  readonly search = output<string>();
  readonly delete = output<string>();

  onSearch(value: string): void {
    this.search.emit(value);
  }
}
