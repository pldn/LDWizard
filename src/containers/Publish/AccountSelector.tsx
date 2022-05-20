import * as React from "react";
import { FormControl, InputLabel, Select, Avatar, MenuItem } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import * as styles from "./style.scss";
import { accountsInfoQuery, currentUserIdState } from "../../state/clientJs";
export interface Props {}

const AccountSelector: React.FC<Props> = () => {
  const accounts = useRecoilValue(accountsInfoQuery);
  const [selectedAccount, setSelectedAccount] = useRecoilState(currentUserIdState);
  return (
    <FormControl className={styles.itemSelector}>
      <InputLabel>Account</InputLabel>
      <Select
        value={selectedAccount}
        onChange={(event) => {
          setSelectedAccount(event.target.value as number);
        }}
        inputProps={{
          className: styles.selectDisplay,
        }}
      >
        {accounts.map((account, idx) => {
          const displayedName = account.name || account.accountName;
          return (
            <MenuItem key={account.accountName} value={idx} className={styles.menuItem}>
              <Avatar alt={displayedName} src={account.avatarUrl} className={styles.avatar}>
                {displayedName?.charAt(0)}
              </Avatar>
              {displayedName}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default AccountSelector;
