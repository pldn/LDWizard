import { IconDefinition, library } from "@fortawesome/fontawesome-svg-core";

/**
 * When adding an icon, first import that icon, and then make sure that icon is added to the lib (bottom of this file) as well
 */
import { faThumbsUp, faCircle, faFileCode, faFile, faFileArchive } from "@fortawesome/free-regular-svg-icons";

import {
  faBook,
  faCircle as faCircleSolid,
  faCaretDown,
  faDatabase,
  faDownload,
  faExclamationTriangle,
  faFileCsv,
  faPlay,
  faInfo,
  faInfoCircle,
  faLongArrowAltDown,
  faPlus,
  faThumbsUp as faThumbsUpSolid,
  faTimes,
  faCheck,
  faMinus,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function registerIcons() {
  library.add(
    faBook as IconDefinition,
    faCaretDown as IconDefinition,
    faCircle,
    faCircleSolid as IconDefinition,
    faDatabase as IconDefinition,
    faDownload as IconDefinition,
    faExclamationTriangle as IconDefinition,
    faGithub,
    faCheck as IconDefinition,
    faPlay as IconDefinition,
    faInfo as IconDefinition,
    faInfoCircle as IconDefinition,
    faFile,
    faFileArchive,
    faFileCode,
    faFileCsv as IconDefinition,
    faLongArrowAltDown as IconDefinition,
    faPlus as IconDefinition,
    faTimes as IconDefinition,
    faThumbsUp,
    faThumbsUpSolid as IconDefinition,
    faUpload as IconDefinition,
    faMinus as IconDefinition
  );
}
declare module "@fortawesome/fontawesome-svg-core" {
  export interface Props {
    title: string;
  }
}
