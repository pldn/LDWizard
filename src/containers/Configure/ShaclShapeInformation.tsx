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

  const requiredProperties = shaclShapeMeta?.properties.filter(property => property.minCount && parseInt(property.minCount)) ?? []
  const optionalProperties = shaclShapeMeta?.properties.filter(property => !(property.minCount && parseInt(property.minCount))) ?? []

  return transformationConfig.shaclShape ? (
    <Accordion variant="outlined" square className={`${styles.accordion} ${styles.normalSettings}`}>
    <AccordionSummary expandIcon={<FontAwesomeIcon icon={["fas", "caret-down"]} />}>
      <Typography>SHACL information</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Required property URI</strong></TableCell>
              <TableCell align="right"><strong>Added</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requiredProperties.map((property) => {
              const required = property.minCount && parseInt(property.minCount)
              const isFound = transformationConfig.columnConfiguration.some(column => column.propertyIri === property.path)

              return (
                <TableRow key={property.path}>
                  <TableCell component="td" scope="row">
                    {property.path}
                  </TableCell>
                  <TableCell component="td" scope="row" align="right">
                  <FontAwesomeIcon icon={["fas", required && isFound || !required ? "check" : "times"]} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <br />
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Optional property URI</strong></TableCell>
              <TableCell align="right"><strong>Added</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {optionalProperties.map((property) => {
              const isFound = transformationConfig.columnConfiguration.some(column => column.propertyIri === property.path)

              return (
                <TableRow key={property.path}>
                  <TableCell component="td" scope="row">
                    {property.path}
                  </TableCell>
                  <TableCell component="td" scope="row" align="right">
                    <FontAwesomeIcon icon={["fas", isFound ? "check" : "minus"]} />
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
