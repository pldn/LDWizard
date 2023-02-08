import * as React from "react";
import { useRecoilState } from "recoil";
import { transformationConfigState } from "../../state";
import { wizardAppConfig } from "../../config";
import { ShaclShapeMeta } from '../../Definitions';

interface Props {
  yes: React.ReactElement,
  no: React.ReactElement
}

const ShaclValidates: React.FC<Props> = ({ yes, no }) => {
  const [transformationConfig] = useRecoilState(transformationConfigState);

  const [shaclShapeMetas, setShaclShapeMetas] = React.useState([] as ShaclShapeMeta[])

  React.useEffect(() => {
    wizardAppConfig.getShaclShapes(transformationConfig.resourceClass)
      .then(shaclShapeMetas => setShaclShapeMetas(shaclShapeMetas))
  }, [transformationConfig]);

  const shaclShapeMeta = shaclShapeMetas.find(shaclShapeMeta => shaclShapeMeta.iri === transformationConfig.shaclShape)
  
  const requiredProperties = (shaclShapeMeta?.properties
    .filter(property => property.minCount && parseInt(property.minCount)) ?? [])
    .map(property => property.path)

  const configuredIris = transformationConfig.columnConfiguration.map(column => column.propertyIri)
  const validates = requiredProperties.every(requiredProperty => configuredIris.includes(requiredProperty))
 
  if (!transformationConfig.shaclShape) return yes
  return validates ? yes : no
}

export default ShaclValidates