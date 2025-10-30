import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Edit, Delete, ArrowBack } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";

import { getTransactions, deleteTransaction } from "src/api/transactions";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [txn, setTxn] = useState<any | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole?.toLowerCase() === "admin";
  const isStaff = userRole?.toLowerCase() === "staff";

  useEffect(() => {
    (async () => {
      try {
        const allTxns = await getTransactions();
        const found = allTxns.find((t: any) => t.id === Number(id));
        setTxn(found);
      } catch {
        enqueueSnackbar("Failed to load transaction", { variant: "error" });
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteTransaction(Number(id));
      enqueueSnackbar("Transaction deleted successfully", { variant: "success" });
      navigate(-1); // Go back
    } catch {
      enqueueSnackbar("Failed to delete", { variant: "error" });
    }
  };

  if (!txn) return <Typography align="center" sx={{ py: 5 }}>Loading...</Typography>;

  return (
    <Box p={2}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
        Back
      </Button>

      <Card sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Transaction Details
          </Typography>

          <Typography><b>Type:</b> {txn.transaction_type}</Typography>
          <Typography><b>Date:</b> {dayjs(txn.date).format("DD MMM YYYY")}</Typography>
          <Typography><b>Time:</b> {txn.time}</Typography>
          <Typography><b>Amount:</b> ₹{txn.amount}</Typography>
          <Typography><b>Category:</b> {txn.category_name}</Typography>
          <Typography><b>Payment Mode:</b> {txn.payment_mode_name}</Typography>
          <Typography><b>Cash Book:</b> {txn.cash_book_name}</Typography>
          <Typography><b>Remarks:</b> {txn.remarks || "-"}</Typography>
          <Typography><b>Party:</b> {txn.party_name || "-"}</Typography>
          <Typography><b>Mobile:</b> {txn.party_mobile_number || "-"}</Typography>
          <Typography><b>Created By:</b> {txn.user_name}</Typography>
        </CardContent>
      </Card>

      {/* Action buttons */}
      {(isAdmin || isStaff) && (
        <Box mt={3} display="flex" justifyContent="center" gap={2}>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              color="primary"
              onClick={() => navigate(`/transaction/${txn.id}/edit`)}
            >
              Edit
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Delete />}
            color="error"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      )}
    </Box>
  );
}