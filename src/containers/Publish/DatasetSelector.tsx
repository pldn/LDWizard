import * as React from "react";
import { FormControl, InputLabel, Select, Avatar, MenuItem } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import styles from "./style.scss";
import { currentDsIdState, userDatasetsState } from "../../state/clientJs.ts";
export interface Props {}

const AccountSelector: React.FC<Props> = () => {
  const datasets = useRecoilValue(userDatasetsState);
  const [selectedDataset, setSelectedDataset] = useRecoilState(currentDsIdState);
  return (
    <FormControl className={styles.itemSelector}>
      <InputLabel>Dataset</InputLabel>
      <Select
        value={datasets.length > 0 ? selectedDataset + "": "empty"}
        onChange={(event) => {
          setSelectedDataset(+event.target.value);
        }}
        displayEmpty
        disabled={datasets.length === 0}
        inputProps={{
          className: styles.selectDisplay,
        }}
      >
        {datasets.length > 0 ? (
          datasets.map((dataset, idx) => {
            const displayedName = dataset.displayName || dataset.name;
            return (
              <MenuItem key={dataset.owner.accountName + dataset.name} value={idx} className={styles.menuItem}>
                <Avatar alt={displayedName} src={dataset.avatarUrl} className={styles.avatar}>
                  {displayedName?.charAt(0)}
                </Avatar>
                {displayedName}
              </MenuItem>
            );
          })
        ) : (
          <MenuItem value="empty">
            <Avatar className={styles.avatar}>X</Avatar>
            This account has no datasets
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default AccountSelector;
