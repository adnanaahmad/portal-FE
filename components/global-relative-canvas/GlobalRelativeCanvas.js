import React from "react";
import DotLoader from "react-spinners/DotLoader";

import styles from "./global-relative-canvas.module.scss";

export default function GlobalRelativeCanvas() {
  return (
    <div className={styles.globalRelativeCanvas}>
      <DotLoader color="#0089D7" />
    </div>
  );
}
