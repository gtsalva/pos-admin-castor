import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { Client } from '../../models/client.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzInputModule, NzPopconfirmModule, NzTagModule, NzIconModule, NzDividerModule, PageHeaderComponent],
  templateUrl: './client-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientListComponent {
  @Input() clients: Client[] = [];
  @Input() total = 0;
  @Input() page = 1;
  @Input() limit = 20;
  @Input() loading = false;

  @Output() searched = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<number>();
  @Output() newClient = new EventEmitter<void>();
  @Output() editClient = new EventEmitter<Client>();
  @Output() deactivateClient = new EventEmitter<Client>();

  searchText = '';
  onSearch(): void { this.searched.emit(this.searchText); }
}
