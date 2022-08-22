import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import AlertDialog from "../dialogs/AlertDialog";

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  closeMenu: () => void;
  deleteTaskcard: () => Promise<void>;
};

const TaskcardMenu = ({ anchorEl, open, closeMenu, deleteTaskcard }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Dialog Controls
  const handleClickOpen = () => {
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };
  return (
    <Menu
      id="more-settings"
      anchorEl={anchorEl}
      open={open}
      onClose={closeMenu}
      MenuListProps={{
        "aria-labelledby": "basic-button",
      }}
    >
      <MenuItem onClick={closeMenu}>Rename list</MenuItem>
      <MenuItem
        onClick={() => {
          handleClickOpen();
        }}
      >
        Delete list
      </MenuItem>
      <AlertDialog
        dialogTitle="Are you sure?"
        open={isDialogOpen}
        handleClose={handleClose}
        handleAlert={deleteTaskcard}
      />
    </Menu>
  );
};

export default TaskcardMenu;
