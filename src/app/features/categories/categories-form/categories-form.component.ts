import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CategoriesAdminApiService } from '../services/categories-api.service';

@Component({
  selector: 'app-categories-form',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    NzButtonModule, NzInputModule, NzFormModule, NzSpinModule, NzSwitchModule,
  ],
  templateUrl: './categories-form.component.html',
  styleUrl: './categories-form.component.less',
})
export class CategoriesFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(CategoriesAdminApiService);
  private readonly msg = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);

  readonly categoryId = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly isLoading = signal(false);
  readonly submitting = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    description: ['']
  });

  get nameCtrl() { return this.form.controls.name; }
  get nameLength() { return this.nameCtrl.value?.length ?? 0; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('categoryId');
    this.categoryId.set(id);
    this.isEdit.set(!!id);

    if (id) {
      this.isLoading.set(true);
      this.api.getAll(true).subscribe({
        next: cats => {
          const cat = cats.find(c => c.category_id === id);
          if (!cat) { this.msg.error('Categoría no encontrada'); this.router.navigate(['/categorias']); return; }
          this.form.patchValue({ name: cat.name, description: cat.description ?? '' });
          this.isLoading.set(false);
        },
        error: () => { this.msg.error('Error al cargar la categoría'); this.isLoading.set(false); },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const { name, description } = this.form.value;
    const payload = { name: name!, description: description || undefined };

    const req$ = this.isEdit()
      ? this.api.update(this.categoryId()!, payload)
      : this.api.create(payload);

    req$.subscribe({
      next: () => {
        this.msg.success(this.isEdit() ? 'Categoría actualizada' : 'Categoría creada');
        this.router.navigate(['/categorias']);
      },
      error: (err) => {
        const msg = err?.error?.message ?? (this.isEdit() ? 'Error al actualizar' : 'Error al crear');
        this.msg.error(msg);
        this.submitting.set(false);
      },
    });
  }
}
