import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LetterOfCredit, LCStatus, LCType } from '../../core/models/letter-of-credit.model';
import { MESSAGES } from '../../shared/constants/messages.constants';

interface LCListFilters {
  status?: LCStatus;
  type?: LCType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  organization?: string;
}

interface LCListResponse {
  items: LetterOfCredit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Component({
  selector: 'app-letter-of-credit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './letter-of-credit-list.component.html',
  styleUrl: './letter-of-credit-list.component.css'
})
export class LetterOfCreditListComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals for reactive state management
  lettersOfCredit = signal<LetterOfCredit[]>([]);
  filteredLettersOfCredit = signal<LetterOfCredit[]>([]);
  isLoading = signal(false);
  totalItems = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  filters = signal<LCListFilters>({});
  selectedTabIndex = signal(0);

  // Template properties
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  // Filter options
  statusOptions = Object.values(LCStatus);
  typeOptions = Object.values(LCType);
  
  // Table configuration
  displayedColumns = ['lcNumber', 'applicant', 'beneficiary', 'amount', 'currency', 'status', 'expiryDate', 'actions'];
  
  // Computed properties
  statusCounts = computed(() => {
    const lcs = this.lettersOfCredit();
    return {
      all: lcs.length,
      draft: lcs.filter(lc => lc.status === LCStatus.DRAFT).length,
      pending: lcs.filter(lc => lc.status === LCStatus.PENDING_APPROVAL).length,
      approved: lcs.filter(lc => lc.status === LCStatus.APPROVED).length,
      documentsSubmitted: lcs.filter(lc => lc.status === LCStatus.DOCUMENTS_SUBMITTED).length,
      completed: lcs.filter(lc => lc.status === LCStatus.COMPLETED).length,
      expired: lcs.filter(lc => lc.status === LCStatus.EXPIRED).length,
      cancelled: lcs.filter(lc => lc.status === LCStatus.CANCELLED).length
    };
  });

  readonly MESSAGES = MESSAGES;
  readonly LCStatus = LCStatus;
  readonly LCType = LCType;

  ngOnInit(): void {
    this.loadLettersOfCredit();
  }

  async loadLettersOfCredit(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      const queryParams = {
        page: this.currentPage() + 1,
        limit: this.pageSize(),
        ...this.filters()
      };

      const response = await this.apiService.get<LCListResponse>('/letters-of-credit', queryParams).toPromise();
      
      if (response?.data) {
        this.lettersOfCredit.set(response.data.items);
        this.totalItems.set(response.data.total);
        this.applyTabFilter();
      }
    } catch (error) {
      console.error('Error loading letters of credit:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
    this.currentPage.set(0);
    this.applyTabFilter();
  }

  private applyTabFilter(): void {
    const allLCs = this.lettersOfCredit();
    const tabIndex = this.selectedTabIndex();
    
    let filtered: LetterOfCredit[] = [];
    
    switch (tabIndex) {
      case 0: // All
        filtered = allLCs;
        break;
      case 1: // Draft
        filtered = allLCs.filter(lc => lc.status === LCStatus.DRAFT);
        break;
      case 2: // Pending
        filtered = allLCs.filter(lc => lc.status === LCStatus.PENDING_APPROVAL);
        break;
      case 3: // Approved
        filtered = allLCs.filter(lc => lc.status === LCStatus.APPROVED);
        break;
      case 4: // Documents Submitted
        filtered = allLCs.filter(lc => lc.status === LCStatus.DOCUMENTS_SUBMITTED);
        break;
      case 5: // Expired
        filtered = allLCs.filter(lc => lc.status === LCStatus.EXPIRED);
        break;
      case 6: // Cancelled
        filtered = allLCs.filter(lc => lc.status === LCStatus.CANCELLED);
        break;
    }
    
    this.filteredLettersOfCredit.set(filtered);
  }

  onSearchChange(searchTerm: string): void {
    const currentFilters = this.filters();
    this.filters.set({
      ...currentFilters,
      search: searchTerm
    });
    this.currentPage.set(0);
    this.loadLettersOfCredit();
  }

  onFilterChange(filterType: keyof LCListFilters, value: any): void {
    const currentFilters = this.filters();
    this.filters.set({
      ...currentFilters,
      [filterType]: value
    });
    this.currentPage.set(0);
    this.loadLettersOfCredit();
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadLettersOfCredit();
  }

  clearFilters(): void {
    this.filters.set({});
    this.currentPage.set(0);
    this.loadLettersOfCredit();
  }

  // Navigation methods
  onCreateLC(): void {
    this.router.navigate(['/letter-of-credit/create']);
  }

  onViewLC(lc: LetterOfCredit): void {
    this.router.navigate(['/letter-of-credit', lc.id]);
  }

  onEditLC(lc: LetterOfCredit): void {
    if (lc.status === LCStatus.DRAFT) {
      this.router.navigate(['/letter-of-credit', lc.id, 'edit']);
    }
  }

  onDuplicateLC(lc: LetterOfCredit): void {
    this.router.navigate(['/letter-of-credit/create'], {
      queryParams: { template: lc.id }
    });
  }

  async onCancelLC(lc: LetterOfCredit): Promise<void> {
    if (confirm('Are you sure you want to cancel this Letter of Credit?')) {
      try {
        await this.apiService.put(`/letters-of-credit/${lc.id}/cancel`, {}).toPromise();
        await this.loadLettersOfCredit();
      } catch (error) {
        console.error('Error cancelling LC:', error);
      }
    }
  }

  async onSubmitForApproval(lc: LetterOfCredit): Promise<void> {
    try {
      await this.apiService.put(`/letters-of-credit/${lc.id}/submit`, {}).toPromise();
      await this.loadLettersOfCredit();
    } catch (error) {
      console.error('Error submitting LC for approval:', error);
    }
  }

  // Utility methods
  canEdit(lc: LetterOfCredit): boolean {
    return lc.status === LCStatus.DRAFT;
  }

  canCancel(lc: LetterOfCredit): boolean {
    return [LCStatus.DRAFT, LCStatus.PENDING_APPROVAL, LCStatus.APPROVED].includes(lc.status);
  }

  canSubmit(lc: LetterOfCredit): boolean {
    return lc.status === LCStatus.DRAFT;
  }

  getStatusColor(status: LCStatus): string {
    switch (status) {
      case LCStatus.DRAFT: return 'default';
      case LCStatus.PENDING_APPROVAL: return 'warning';
      case LCStatus.APPROVED: return 'accent';
      case LCStatus.DOCUMENTS_SUBMITTED: return 'primary';
      case LCStatus.COMPLETED: return 'success';
      case LCStatus.EXPIRED: return 'error';
      case LCStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  }

  getStatusIcon(status: LCStatus): string {
    switch (status) {
      case LCStatus.DRAFT: return 'edit';
      case LCStatus.PENDING_APPROVAL: return 'hourglass_empty';
      case LCStatus.APPROVED: return 'check_circle';
      case LCStatus.DOCUMENTS_SUBMITTED: return 'description';
      case LCStatus.COMPLETED: return 'done_all';
      case LCStatus.EXPIRED: return 'schedule';
      case LCStatus.CANCELLED: return 'cancel';
      default: return 'help';
    }
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isExpiringSoon(expiryDate: Date | string): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }

  // Helper methods for template
  trackByLCId(index: number, item: LetterOfCredit): string {
    return item.id;
  }

  getStatusLabel(status: LCStatus): string {
    const statusLabels: Record<LCStatus, string> = {
      [LCStatus.DRAFT]: 'Draft',
      [LCStatus.PENDING_APPROVAL]: 'Pending Approval',
      [LCStatus.APPROVED]: 'Approved',
      [LCStatus.ISSUED]: 'Issued',
      [LCStatus.ADVISED]: 'Advised',
      [LCStatus.CONFIRMED]: 'Confirmed',
      [LCStatus.DOCUMENTS_SUBMITTED]: 'Documents Submitted',
      [LCStatus.DOCUMENTS_UNDER_REVIEW]: 'Under Review',
      [LCStatus.DOCUMENTS_COMPLIANT]: 'Documents Compliant',
      [LCStatus.DOCUMENTS_WITH_DISCREPANCIES]: 'Has Discrepancies',
      [LCStatus.PAYMENT_AUTHORIZED]: 'Payment Authorized',
      [LCStatus.PAYMENT_PROCESSED]: 'Payment Processed',
      [LCStatus.COMPLETED]: 'Completed',
      [LCStatus.CANCELLED]: 'Cancelled',
      [LCStatus.EXPIRED]: 'Expired',
      [LCStatus.REJECTED]: 'Rejected'
    };
    return statusLabels[status] || status;
  }

  getTypeLabel(type: LCType): string {
    const typeLabels: Record<LCType, string> = {
      [LCType.COMMERCIAL]: 'Commercial',
      [LCType.STANDBY]: 'Standby',
      [LCType.REVOLVING]: 'Revolving',
      [LCType.TRANSFERABLE]: 'Transferable',
      [LCType.BACK_TO_BACK]: 'Back-to-Back',
      [LCType.RED_CLAUSE]: 'Red Clause',
      [LCType.GREEN_CLAUSE]: 'Green Clause'
    };
    return typeLabels[type] || type;
  }

  hasQuickAction(lc: LetterOfCredit): boolean {
    return lc.status === LCStatus.DRAFT || 
           lc.status === LCStatus.PENDING_APPROVAL || 
           lc.status === LCStatus.DOCUMENTS_SUBMITTED;
  }

  getQuickActionLabel(lc: LetterOfCredit): string {
    switch (lc.status) {
      case LCStatus.DRAFT:
        return 'Submit';
      case LCStatus.PENDING_APPROVAL:
        return 'Review';
      case LCStatus.DOCUMENTS_SUBMITTED:
        return 'Verify';
      default:
        return 'View';
    }
  }

  performQuickAction(lc: LetterOfCredit): void {
    console.log('Quick action for LC:', lc.id);
  }

  // Filter methods
  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilter(): void {
    this.applyFilters();
  }

  onTypeFilter(): void {
    this.applyFilters();
  }

  onClearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.lettersOfCredit();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(lc => 
        lc.lcNumber.toLowerCase().includes(term) ||
        lc.applicant.name.toLowerCase().includes(term) ||
        lc.beneficiary.name.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(lc => lc.status === this.selectedStatus as LCStatus);
    }

    if (this.selectedType) {
      filtered = filtered.filter(lc => lc.type === this.selectedType as LCType);
    }

    this.filteredLettersOfCredit.set(filtered);
  }
}
