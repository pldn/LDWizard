import * as React from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { transformationConfigState, matrixState } from "../../state/index.ts";
import { FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";
import HintWrapper from "../../components/HintWrapper/index.tsx";

import { some } from "lodash-es";

import styles from "./style.scss";
import { Matrix, SelectKeyColumn } from "../../Definitions.ts";

interface Props {}

function getDuplicateColumnIds(matrix: Matrix): number[] {
  if (matrix.length === 0) return [];
  return (
    matrix[0]
      .map((_header, columnIndex) => {
        // For every column
        const isDuplicate = some(matrix, (checkRow, checkRowIndex) => {
          // Find the first match where:
          if (checkRowIndex === 0) return false; // Skip header row
          // Theres a duplicate in a raw (which is not the current one)
          return matrix.findIndex((row) => row[columnIndex] === checkRow[columnIndex]) !== checkRowIndex;
        });
        // Return id if a duplicate is found, else return -1
        if (isDuplicate) return columnIndex;
        return -1;
      })
      // Return only the ids of columns with duplicates
      .filter((columnId) => columnId >= 0)
  );
}

const ColumnSelector: React.FC<Props> = () => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);
  const matrix = useRecoilValue(matrixState);
  if (!matrix) return null;
  const columnsWithDuplicates = getDuplicateColumnIds(matrix);
  const selectKeyColumn: SelectKeyColumn = (key) => {
    setTransformationConfig((state) => {
      const selectedColumn = state.columnConfiguration[key];
      // We need to reset the property URI if it's already assigned
      if (selectedColumn) {
        const columnConfig = [...state.columnConfiguration];
        columnConfig[key] = {
          columnName: selectedColumn.columnName,
          propertyIri: undefined,
        };

        return {
          ...state,
          key: key,
          columnConfiguration: columnConfig,
        };
      } else {
        return { ...state, key: undefined };
      }
    });
  };
  return (
    <div className={styles.keyColumnWrapper}>
      <HintWrapper hint="The key column will be used to generate identifiers for each row. Grayed out options contain duplicate values">
        <FormControl className={styles.keyColumnSelector}>
          <InputLabel>Key column</InputLabel>
          <Select
            displayEmpty
            defaultValue={-1}
            value={transformationConfig.key ?? -1}
            onChange={(event) => {
              if (typeof event.target.value === "number") selectKeyColumn(event.target.value);
            }}
          >
            <MenuItem value={-1}>Row number</MenuItem>
            {transformationConfig.columnConfiguration.map((config, idx) => (
              <MenuItem key={config.columnName} value={idx} disabled={columnsWithDuplicates.indexOf(idx) >= 0}>
                {config.columnName}
                {columnsWithDuplicates.indexOf(idx) >= 0 && (
                  <Typography variant="caption" className={styles.duplicateWarning}>
                    Contains duplicates
                  </Typography>
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </HintWrapper>
    </div>
  );
};

export default ColumnSelector;
