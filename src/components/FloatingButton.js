// components/FloatingButton.js
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import styles from "./FloatingButton.module.css"; // Custom styling

const FloatingButton = ({ onClick }) => {
  return (
    <Fab
      color="primary"
      aria-label="add"
      className={styles.fab}
      onClick={onClick}
    >
      <AddIcon />
    </Fab>
  );
};

export default FloatingButton;
