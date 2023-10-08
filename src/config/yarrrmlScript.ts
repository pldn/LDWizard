import { TransformationScript, TransformationConfiguration } from "../Definitions.ts";
import { Parser, Store } from "n3";
import getRmlTransformationScript from "./rmlScript.ts";
import convertRMLtoYAML from "@rmlio/yarrrml-parser/lib/yarrrml-generator";

async function getYarrrmlTransformationScript(configuration: TransformationConfiguration): Promise<TransformationScript> {
  const rmlString = await getRmlTransformationScript(configuration);
  const parser = new Parser()
  const prefixes = {}
  const rmlStore = new Store(
    parser.parse(rmlString.toString(), null, (prefix, namespace) => {
      prefixes[prefix] = namespace['id']
    })
  )
  const yarrrmlMappings = await convertRMLtoYAML(rmlStore.getQuads(null, null, null, null), prefixes)
  return yarrrmlMappings;
}

export default getYarrrmlTransformationScript;
