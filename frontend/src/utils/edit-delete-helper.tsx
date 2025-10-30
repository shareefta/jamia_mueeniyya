import { IconButton, Box } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

interface TxnActionButtonsProps {
  txn: any;
  onEdit: (txn: any) => void;
  onDelete: (id: number) => void;
  size?: "small" | "medium";
  direction?: "row" | "column"; // for flexibility
}

const TxnActionButtons: React.FC<TxnActionButtonsProps> = ({
  txn,
  onEdit,
  onDelete,
  size = "small",
  direction = "row",
}) => {
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole?.toLowerCase() === "admin";
  const isStaff = userRole?.toLowerCase() === "staff";

  return (
    <Box display="flex" flexDirection={direction} gap={0.5}>
      {isAdmin && (
        <IconButton
          color="primary"
          size={size}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(txn);
          }}
        >
          <Edit fontSize={size} />
        </IconButton>
      )}
      {(isAdmin || isStaff) && (
        <IconButton
          color="error"
          size={size}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(txn.id);
          }}
        >
          <Delete fontSize={size} />
        </IconButton>
      )}
    </Box>
  );
};

export default TxnActionButtons;