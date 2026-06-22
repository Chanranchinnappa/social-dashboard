import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

const SortIcon = ({ column, sortConfig }) => {
  if (!sortConfig || sortConfig.key !== column) {
    return <ChevronsUpDown size={14} className="sort-icon" aria-hidden="true" />;
  }
  return sortConfig.direction === 'asc'
    ? <ChevronUp size={14} className="sort-icon sort-icon-active" aria-hidden="true" />
    : <ChevronDown size={14} className="sort-icon sort-icon-active" aria-hidden="true" />;
};

export const DataTable = React.forwardRef(function DataTable(
  {
    columns = [],
    data = [],
    isLoading = false,
    emptyTitle = 'No data available',
    emptyDescription = 'There are no records to display.',
    sortable = true,
    defaultSortKey,
    defaultSortDirection = 'asc',
    className = '',
  },
  ref
) {
  const [sortConfig, setSortConfig] = useState(
    defaultSortKey
      ? { key: defaultSortKey, direction: defaultSortDirection }
      : null
  );

  const handleSort = (columnKey) => {
    if (!sortable) return;
    setSortConfig((prev) => {
      if (!prev || prev.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return null;
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    const col = columns.find((c) => c.key === sortConfig.key);
    return [...data].sort((a, b) => {
      const aVal = col?.accessor ? col.accessor(a) : a[sortConfig.key];
      const bVal = col?.accessor ? col.accessor(b) : b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const result = typeof aVal === 'string'
        ? aVal.localeCompare(bVal)
        : aVal - bVal;
      return sortConfig.direction === 'desc' ? -result : result;
    });
  }, [data, sortConfig, columns]);

  if (isLoading) {
    return (
      <div className={['data-table-wrapper', className].filter(Boolean).join(' ')}>
        <Skeleton variant="table" rows={5} />
      </div>
    );
  }

  return (
    <div ref={ref} className={['data-table-wrapper', className].filter(Boolean).join(' ')}>
      {sortedData.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon="file"
        />
      ) : (
        <div className="data-table-scroll">
          <table className="data-table" role="table">
            <thead className="data-table-head">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={[
                      'data-table-th',
                      col.sortable !== false && sortable ? 'data-table-th-sortable' : '',
                      col.className || '',
                    ].filter(Boolean).join(' ')}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() =>
                      col.sortable !== false && sortable && handleSort(col.key)
                    }
                    aria-sort={
                      sortConfig?.key === col.key
                        ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                        : undefined
                    }
                  >
                    <span className="data-table-th-content">
                      {col.label}
                      {col.sortable !== false && sortable && (
                        <SortIcon column={col.key} sortConfig={sortConfig} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="data-table-body">
              {sortedData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="data-table-row">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={['data-table-td', col.tdClassName || ''].filter(Boolean).join(' ')}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessor
                          ? col.accessor(row)
                          : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
