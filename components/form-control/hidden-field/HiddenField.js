import React from "react";
import styles from "./hidden-field.module.scss";

export default function HiddenField({ type, name }) {
  if (name)
    return (
      <input type={type || "text"} className={styles.hiddenField} name={name} />
    );
  return <input type={type || "text"} className={styles.hiddenField} />;
}
