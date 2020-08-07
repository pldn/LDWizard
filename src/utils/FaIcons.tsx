import { library } from "@fortawesome/fontawesome-svg-core";

/**
 * When adding an icon, first import that icon, and then make sure that icon is added to the lib (bottom of this file) as well
 */
import { faThumbsUp, faCircle, faFileCode, faFile, faFileArchive } from "@fortawesome/free-regular-svg-icons";

import {
  faCircle as faCircleSolid,
  faExclamationTriangle,
  faInfoCircle,
  faFileCsv,
  faThumbsUp as faThumbsUpSolid,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

export default function registerIcons() {
  library.add(
    faCircle,
    faCircleSolid,
    faExclamationTriangle,
    faInfoCircle,
    faFile,
    faFileArchive,
    faFileCode,
    faFileCsv,
    faThumbsUp,
    faThumbsUpSolid,
    faUpload
  );
}
declare module "@fortawesome/fontawesome-svg-core" {
  export interface Props {
    title: string;
  }
}
