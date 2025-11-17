import jsPDF from 'jspdf';
import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import autoTable from 'jspdf-autotable';

import { Box, IconButton } from '@mui/material';
import { PictureAsPdf, GridOn } from '@mui/icons-material';

type Txn = any;

interface Props {
  transactions: Txn[];
  filters: any;
  openingBalances: any[];
  cashBooks: any[];
  campusName?: string;
  displayedOB: number;
}

const currency = (n: number) => {
  if (isNaN(n)) return '';
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ExportReports: React.FC<Props> = ({ transactions, filters, openingBalances, cashBooks, campusName, displayedOB}) => {
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
  const totalIn = transactions
    .filter((t: any) => t.transaction_type === 'IN')
    .reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);

  const totalOut = transactions
    .filter((t: any) => t.transaction_type === 'OUT')
    .reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);

  const ob = filters.includeOB ? displayedOB : 0; // ✅ Use dynamic OB
  const net = ob + totalIn - totalOut;

  return { totalIn, totalOut, ob, net };
};

  // Build table rows for PDF/XLSX
  const buildRows = () => transactions.map((t: any, idx: number) => ([
    idx + 1,
    `${t.date}\n${t.time}`,
    `${t.remarks || ''}\n Created by: ${t.user_name || t.user || ''}`,
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

    // --- Header ---
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

    // --- Summary Cards ---
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
      doc.setDrawColor(200);
      doc.roundedRect(x, cardY, cardW - 10, cardH, 6, 6);
      doc.setFontSize(9);
      doc.text(c.title, x + 10, cardY + 15);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(c.value, x + 10, cardY + 32);
      doc.setFont('helvetica', 'normal');
    });

    // --- Table ---
    const startY = cardY + cardH + 20;
    const head = [[
      'Sl. No.', 'Date & Time', 'Remarks & User', 'Party & Mobile', 'Category', 'Mode', 'Amount', 'Balance'
    ]];

    const body = buildRows();

    autoTable(doc, {
      startY,
      head,
      body,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: 'linebreak', // wrap text in long columns
      },
      headStyles: {
        fillColor: [41, 98, 255],
        textColor: 255,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'center' }, // Sl. No
        1: { cellWidth: 70 },  // Date & Time
        2: { cellWidth: 100 }, // Remarks & User
        3: { cellWidth: 100 }, // Party & Mobile
        4: { cellWidth: 60 },  // Category
        5: { cellWidth: 50 },  // Mode
        6: { cellWidth: 50, halign: 'right' }, // Amount
        7: { cellWidth: 50, halign: 'right' }, // Balance
      },
      tableWidth: 'auto', // fit page width
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          pageWidth - 40,
          doc.internal.pageSize.getHeight() - 20,
          { align: 'right' }
        );
      },
    });

    doc.save(`${fileTitleBase}.pdf`);
  };

  // Excel generator
  const generateExcel = () => {
    if (!transactions || transactions.length === 0) {
      alert("No transactions to export!");
      return;
    }

    const sums = calcSummaries();

    // --- Meta Information Rows ---
    const metaRows = [
      ['Campus', campusName || 'All Campuses'],
      ['Cash Book', getCashBookLabel()],
      ['Date Range', getDateLabel()],
      [],
      ['Opening Balance', sums.ob],
      ['Total In', sums.totalIn],
      ['Total Out', sums.totalOut],
      ['Net Balance', sums.net],
      [],
      [
        "Date",
        "Time",
        "Remarks",
        "Entered By",
        "Party Name",
        "Mobile Number",
        "Category",
        "Mode",
        "Cash In",
        "Cash Out",
        "Balance"
      ]
    ];

    // --- Transaction Rows ---
    const txnRows = transactions.map((t: any) => {
      const amount = Number(t.amount || 0);

      const cashIn = t.transaction_type === "IN" ? amount : "";
      const cashOut = t.transaction_type === "OUT" ? amount : "";

      return [
        t.date || "",
        t.time || "",
        t.remarks || "",
        t.user_name || t.user || "",
        t.party_name || "",
        t.party_mobile_number || "",
        t.category_name || t.category || "",
        t.payment_mode_name || t.payment_mode || "",
        cashIn,
        cashOut,
        Number(t.running_balance || 0)
      ];
    });

    const allRows = [...metaRows, ...txnRows];

    // Generate worksheet
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Auto column sizing
    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 10 }, // Time
      { wch: 25 }, // Remarks
      { wch: 15 }, // Entered by
      { wch: 20 }, // Party Name
      { wch: 15 }, // Mobile
      { wch: 15 }, // Category
      { wch: 12 }, // Mode
      { wch: 12 }, // Cash In
      { wch: 12 }, // Cash Out
      { wch: 12 }  // Balance
    ];

    // Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    saveAs(blob, `${fileTitleBase}.xlsx`);
  };

  return (
    <Box display="flex" gap={1}>
      <IconButton onClick={generatePDF} color="primary">
        <PictureAsPdf />  {/* MUI icon */}
      </IconButton>
      <IconButton onClick={generateExcel} color="primary">
        <GridOn />  {/* Or any Excel icon */}
      </IconButton>
    </Box>
  );
};

export default ExportReports;