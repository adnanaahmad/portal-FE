import React from "react";
import DotLoader from "react-spinners/DotLoader";

import styles from "./global-canvas.module.scss";

export default function GlobalCanvas() {
  return (
    <div className={styles.globalCanvas}>
      <DotLoader color="#0089D7" />
    </div>
  );
}
