import type { ReactNode } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Inbox } from 'lucide-react';

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, text }: { icon?: ReactNode; text?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: 12,
    }}>
      <div style={{ color: 'var(--border-strong)', opacity: 0.6 }}>
        {icon ?? <Inbox size={36} strokeWidth={1.5} />}
      </div>
      <p style={{
        margin: 0,
        fontSize: 13,
        color: 'var(--text-tertiary)',
        fontFamily: 'Inter, sans-serif',
      }}>
        {text ?? 'No records found'}
      </p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface DataTableProps<T extends object> extends Omit<TableProps<T>, 'locale' | 'columns'> {
  columns: TableProps<T>['columns'];
  dataSource: T[];
  rowKey: string | ((record: T) => string);
  /** Show loading skeleton */
  loading?: boolean;
  /** Custom empty state message */
  emptyText?: string;
  /** Custom empty state icon */
  emptyIcon?: ReactNode;
  /** Add a top action bar (e.g. search + button row) */
  toolbar?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DataTable<T extends object>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  emptyText,
  emptyIcon,
  toolbar,
  pagination,
  ...rest
}: DataTableProps<T>) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Optional toolbar slot */}
      {toolbar && (
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {toolbar}
        </div>
      )}

      <Table<T>
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        size="middle"
        pagination={pagination === false ? false : {
          size: 'default',
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total: number, range: [number, number]) => (
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>
              {range[0]}–{range[1]} of {total}
            </span>
          ),
          style: {
            padding: '12px 20px',
            margin: 0,
            borderTop: '1px solid var(--border-subtle)',
          },
          ...( typeof pagination === 'object' ? pagination : {} ),
        }}
        locale={{
          emptyText: <EmptyState icon={emptyIcon} text={emptyText} />,
        }}
        style={{ margin: 0 }}
        className="safeops-datatable"
        {...rest}
      />

      <style>{`
        .safeops-datatable .ant-table {
          background: transparent !important;
          font-family: 'Inter', sans-serif;
        }
        .safeops-datatable .ant-table-container {
          border: none !important;
        }
        .safeops-datatable .ant-table-thead > tr > th {
          background: var(--bg-elevated) !important;
          color: var(--text-tertiary) !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          letter-spacing: 0.07em !important;
          text-transform: uppercase !important;
          border-bottom: 1px solid var(--border-default) !important;
          padding: 10px 16px !important;
        }
        .safeops-datatable .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .safeops-datatable .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid var(--border-subtle) !important;
          color: var(--text-primary) !important;
          padding: 12px 16px !important;
          font-size: 13px !important;
          transition: background 100ms ease !important;
        }
        .safeops-datatable .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .safeops-datatable .ant-table-tbody > tr:hover > td {
          background: var(--table-row-hover) !important;
        }
        .safeops-datatable .ant-table-row {
          cursor: default;
        }
        .safeops-datatable .ant-pagination {
          padding: 12px 20px !important;
          margin: 0 !important;
          border-top: 1px solid var(--border-subtle);
        }
        .safeops-datatable .ant-pagination-item {
          background: transparent !important;
          border-color: var(--border-default) !important;
        }
        .safeops-datatable .ant-pagination-item a {
          color: var(--text-secondary) !important;
          font-size: 12px !important;
        }
        .safeops-datatable .ant-pagination-item-active {
          border-color: var(--brand-500) !important;
        }
        .safeops-datatable .ant-pagination-item-active a {
          color: var(--brand-500) !important;
        }
        .safeops-datatable .ant-pagination-prev button,
        .safeops-datatable .ant-pagination-next button {
          background: transparent !important;
          border-color: var(--border-default) !important;
          color: var(--text-secondary) !important;
        }
        .safeops-datatable .ant-spin-dot-item {
          background-color: var(--brand-500) !important;
        }
      `}</style>
    </div>
  );
}
