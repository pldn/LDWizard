import * as React from "react";
import { ButtonGroup, Button, Box, Popper, ClickAwayListener, MenuList, MenuItem, Paper } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./style.scss";
interface Props<T = string> {
  onActionSelected: (actionKey: T) => void;
  actions: T[];
  getButtonlabel?: (selectedAction: T) => string;
  getOptionsLabel?: (action: T) => string;
}

const SplitButton: React.FC<Props> = ({ actions, onActionSelected, getButtonlabel, getOptionsLabel }) => {
  const [selectedAction, setSelectedAction] = React.useState(actions[0]);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const closePopper = () => setOpen(false);
  return (
    <Box>
      <ButtonGroup variant="contained" color="primary">
        <Button
          className={styles.mainButton}
          ref={anchorRef}
          onClick={() => onActionSelected(selectedAction)}
          fullWidth
        >
          {getButtonlabel ? getButtonlabel(selectedAction) : selectedAction}
        </Button>
        <Button size="small" onClick={() => setOpen(true)}>
          <FontAwesomeIcon icon="caret-down" />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} className={styles.popper}>
        <Paper>
          <ClickAwayListener onClickAway={closePopper}>
            <MenuList>
              {actions.map((action) => (
                <MenuItem
                  key={action}
                  selected={action === selectedAction}
                  onClick={() => {
                    setSelectedAction(action);
                    closePopper();
                  }}
                >
                  {getOptionsLabel ? getOptionsLabel(action) : action}
                </MenuItem>
              ))}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </Box>
  );
};

export default SplitButton;
