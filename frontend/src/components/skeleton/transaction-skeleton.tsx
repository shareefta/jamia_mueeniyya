import { Box, Card, Paper, Table, TableHead, TableRow, TableCell, TableBody, Skeleton } from "@mui/material";

const TransactionSkeleton = ({ isMobile }: { isMobile: boolean }) => {
  if (isMobile) {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="rectangular" height={50} sx={{ mt: 1, borderRadius: 1 }} />
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            {[
              "#",
              "Date & Time",
              "Details",
              "Party",
              "Category",
              "Mode",
              "Amount",
              "Balance",
              "Action",
            ].map((col) => (
              <TableCell key={col}>
                <Skeleton variant="text" width="80%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 9 }).map((__, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" animation="wave" width="90%" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default TransactionSkeleton;