import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CategoriesAdminApiService } from '../services/categories-api.service';
import { Category } from '../models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    RouterLink,
    NzTableModule, NzButtonModule, NzInputModule,
    NzIconModule, NzPopconfirmModule, NzSpinModule, NzSelectModule,
    PageHeaderComponent,
  ],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.less',
})
export class CategoriesListComponent implements OnInit {
  private readonly api = inject(CategoriesAdminApiService);
  private readonly msg = inject(NzMessageService);

  readonly isLoading = signal(false);
  readonly allCategories = signal<Category[]>([]);
  readonly searchQuery = signal('');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('active');
  readonly togglingId = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    return this.allCategories().filter(c => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q);
      const matchStatus = status === 'all' ||
        (status === 'active' && c.is_active) ||
        (status === 'inactive' && !c.is_active);
      return matchSearch && matchStatus;
    });
  });

  readonly activeCount = computed(() => this.allCategories().filter(c => c.is_active).length);
  readonly inactiveCount = computed(() => this.allCategories().filter(c => !c.is_active).length);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.api.getAll(true).subscribe({
      next: cats => { this.allCategories.set(cats); this.isLoading.set(false); },
      error: () => { this.msg.error('Error al cargar categorías'); this.isLoading.set(false); },
    });
  }

  toggleActive(cat: Category): void {
    this.togglingId.set(cat.category_id);
    this.api.update(cat.category_id, { is_active: !cat.is_active }).subscribe({
      next: updated => {
        this.allCategories.update(list =>
          list.map(c => c.category_id === updated.category_id ? updated : c),
        );
        this.msg.success(updated.is_active ? 'Categoría activada' : 'Categoría desactivada');
        this.togglingId.set(null);
      },
      error: () => {
        this.msg.error('Error al actualizar la categoría');
        this.togglingId.set(null);
      },
    });
  }
}
