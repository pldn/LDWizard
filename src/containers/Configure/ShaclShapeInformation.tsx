import * as React from "react";
import { wizardAppConfig } from "../../config";
import { useRecoilState } from "recoil";
import { transformationConfigState } from "../../state";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead
} from "@mui/material";
import styles from "./style.scss";
import { ShaclShapeMeta } from '../../Definitions';
import FontAwesomeIcon from "../../components/FontAwesomeIcon";

interface Props {}

const ShaclShapeInformation: React.FC<Props> = ({}) => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);

  const [shaclShapeMetas, setShaclShapeMetas] = React.useState([] as ShaclShapeMeta[])

  React.useEffect(() => {
    wizardAppConfig.getShaclShapes(transformationConfig.resourceClass)
      .then(shaclShapeMetas => setShaclShapeMetas(shaclShapeMetas))
  }, [transformationConfig]);

  const shaclShapeMeta = shaclShapeMetas.find(shaclShapeMeta => shaclShapeMeta.iri === transformationConfig.shaclShape)

  return transformationConfig.shaclShape ? (
    <Accordion variant="outlined" square className={`${styles.accordion} ${styles.normalSettings}`}>
    <AccordionSummary expandIcon={<FontAwesomeIcon icon={["fas", "caret-down"]} />}>
      <Typography>SHACL requirements</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Property URI</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Validates</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shaclShapeMeta?.properties.map((property) => {
              const required = property.minCount && parseInt(property.minCount)
              const isFound = transformationConfig.columnConfiguration.some(column => column.propertyIri === property.path)

              return (
                <TableRow key={property.path}>
                  <TableCell component="td" scope="row">
                    {property.path}
                  </TableCell>
                  <TableCell component="td" scope="row">
                    <FontAwesomeIcon icon={["fas", required ? "check" : "minus"]} />
                  </TableCell>
                  <TableCell component="td" scope="row">
                  <FontAwesomeIcon icon={["fas", required && isFound || !required ? "check" : "times"]} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </AccordionDetails>
  </Accordion>
  ) : null
};
export default ShaclShapeInformation;
