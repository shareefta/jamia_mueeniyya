import 'jspdf-autotable';

import jsPDF from 'jspdf';
import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { Button, Box } from '@mui/material';

/**
 * ExportReports.tsx
 * -----------------
 * A reusable React component that takes your computed transactions, filters and
 * opening balances and generates:
 *  - PDF report (styled to match your requested layout)
 *  - Excel (.xlsx) report
 *
 * Usage:
 *  <ExportReports
 *     transactions={computedTxns}
 *     filters={filters}
 *     openingBalances={openingBalances}
 *     cashBooks={cashBooks}
 *     campusName={selectedCampusName}
 *  />
 *
 * npm/yarn packages required:
 *  npm i jspdf jspdf-autotable xlsx file-saver
 *
 * Notes:
 *  - This component is framework-agnostic in the sense it only depends on data
 *    you already have in the page (computedTxns, filters, lists etc.)
 *  - It uses jsPDF + autotable to create a neat PDF and XLSX for Excel export.
 */

type Txn = any;

interface Props {
  transactions: Txn[]; // should be the computedTxns (includes running_balance)
  filters: any;
  openingBalances: any[];
  cashBooks: any[];
  campusName?: string; // optional: if you have campus info
}

const currency = (n: number) => {
  if (isNaN(n)) return '';
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ExportReports: React.FC<Props> = ({ transactions, filters, openingBalances, cashBooks, campusName }) => {
  const fileTitleBase = `Transactions_Report_${(new Date()).toISOString().slice(0,10)}`;

  const getCashBookLabel = () => {
    if (!filters.cash_book || filters.cash_book === 'All') return 'All Cash Books';
    const cb = cashBooks.find((c: any) => Number(c.id) === Number(filters.cash_book));
    return cb ? `${cb.name}` : `Cash Book ${filters.cash_book}`;
  };

  const getDateLabel = () => {
    if (filters.dateRange === 'Custom') {
      if (filters.customDateType === 'single') return filters.customStartDate;
      return `${filters.customStartDate || ''} to ${filters.customEndDate || ''}`;
    }
    return filters.dateRange || 'All Dates';
  };

  // Calculate summary cards from the passed transactions (should be running-balance included)
  const calcSummaries = () => {
    const totalIn = transactions.filter((t: any) => t.transaction_type === 'IN').reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
    const totalOut = transactions.filter((t: any) => t.transaction_type === 'OUT').reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
    const ob = (() => {
      if (!filters.includeOB) return 0;
      if (!filters.cash_book || filters.cash_book === 'All') return openingBalances.reduce((a,b) => a + Number(b.amount || 0), 0);
      const obItem = openingBalances.find(o => Number(o.cash_book) === Number(filters.cash_book));
      return obItem ? Number(obItem.amount) : 0;
    })();

    const net = ob + totalIn - totalOut;
    return { totalIn, totalOut, ob, net };
  };

  // Build table rows for PDF/XLSX
  const buildRows = () => transactions.map((t: any, idx: number) => ([
    idx + 1,
    `${t.date}\n${t.time}`,
    `${t.remarks || ''}\n${t.user_name || t.user || ''}`,
    `${t.party_name || ''}\n${t.party_mobile_number || ''}`,
    t.category_name || t.category || '',
    t.payment_mode_name || t.payment_mode || '',
    currency(Number(t.amount || 0)),
    currency(Number(t.running_balance || 0)),
  ]));

  // PDF generator
  const generatePDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header: campus and cashbook centered with some decoration
    const campusLabel = campusName || 'Campus';
    const cashbookLabel = getCashBookLabel();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(campusLabel, pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(cashbookLabel, pageWidth / 2, 60, { align: 'center' });

    // Date range
    doc.setFontSize(10);
    doc.text(`Date: ${getDateLabel()}`, 40, 90);

    // Summary cards - we draw small rounded boxes
    const sums = calcSummaries();
    const cardW = (pageWidth - 80) / 4;
    const cardH = 40;
    const cardY = 110;
    const cardXStart = 40;

    const cardData = [
      { title: 'Opening Balance', value: currency(sums.ob) },
      { title: 'Total In', value: currency(sums.totalIn) },
      { title: 'Total Out', value: currency(sums.totalOut) },
      { title: 'Net Balance', value: currency(sums.net) },
    ];

    cardData.forEach((c, i) => {
      const x = cardXStart + i * cardW;
      // rounded rect (simple)
      doc.setDrawColor(200);
      doc.roundedRect(x, cardY, cardW - 10, cardH, 6, 6);
      doc.setFontSize(9);
      doc.text(c.title, x + 10, cardY + 15);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(c.value, x + 10, cardY + 32);
      doc.setFont('helvetica', 'normal');
    });

    // Table using autotable
    const startY = cardY + cardH + 20;

    // Build columns with headers and data
    // We'll use autoTable to handle multi-line cells (\n)
    // Column headers as requested
    const head = [[
      'Sl. No.', 'Date & Time', 'Remarks & User', 'Party & Mobile', 'Category', 'Mode', 'Amount', 'Balance'
    ]];

    const body = buildRows();

    // autoTable with styles to make it attractive
    (doc as any).autoTable({
      startY,
      head,
      body,
      headStyles: { fillColor: [41, 98, 255], textColor: 255, halign: 'center' },
      styles: { fontSize: 9, cellPadding: 6 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 80 },
        2: { cellWidth: 150 },
        3: { cellWidth: 120 },
        4: { cellWidth: 70 },
        5: { cellWidth: 60 },
        6: { cellWidth: 70, halign: 'right' },
        7: { cellWidth: 70, halign: 'right' },
      },
      didParseCell: function (data: any) {
        // center serial numbers
        if (data.section === 'body' && data.column.index === 0) {
          data.cell.styles.halign = 'center';
        }
      },
      didDrawPage: function (data: any) {
        // footer with page number
        const page = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber}`, pageWidth - 40, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
      }
    });

    doc.save(`${fileTitleBase}.pdf`);
  };

  // Excel generator
  const generateExcel = () => {
    // Build worksheet rows as objects
    const rows = transactions.map((t: any, idx: number) => ({
      'Sl. No.': idx + 1,
      'Date & Time': `${t.date} ${t.time}`,
      'Remarks & User': `${t.remarks || ''} / ${t.user_name || t.user || ''}`,
      'Party & Mobile': `${t.party_name || ''} / ${t.party_mobile_number || ''}`,
      'Category': t.category_name || t.category || '',
      'Mode': t.payment_mode_name || t.payment_mode || '',
      'Amount': Number(t.amount || 0),
      'Balance': Number(t.running_balance || 0),
    }));

    // Add a header sheet with summary and meta as the first sheet
    const wb = XLSX.utils.book_new();

    // Meta/summary sheet
    const sums = calcSummaries();
    const metaData = [
      ['Campus', campusName || 'All Campuses'],
      ['Cash Book', getCashBookLabel()],
      ['Date Range', getDateLabel()],
      [],
      ['Opening Balance', sums.ob],
      ['Total In', sums.totalIn],
      ['Total Out', sums.totalOut],
      ['Net Balance', sums.net],
    ];
    const metaWs = XLSX.utils.aoa_to_sheet(metaData);
    XLSX.utils.book_append_sheet(wb, metaWs, 'Summary');

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Auto-width (simple heuristic)
    const setColumnWidths = (sheet: any, jsonRows: any[]) => {
      const cols = Object.keys(jsonRows[0] || {}).map((k) => ({ wch: Math.max(10, k.length + 4) }));
      sheet['!cols'] = cols;
    };
    if (rows.length) setColumnWidths(ws, rows);

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], { type: 'application/octet-stream' });
    saveAs(blob, `${fileTitleBase}.xlsx`);
  };

  return (
    <Box display="flex" gap={2}>
      <Button variant="contained" onClick={generatePDF}>Download PDF</Button>
      <Button variant="outlined" onClick={generateExcel}>Download Excel</Button>
    </Box>
  );
};

export default ExportReports;