import React from "react";
import styles from "./form-input/form-input.module.scss";

export default function FormTextarea({
  required,
  value,
  placeholder,
  onChange,
  rows,
  additionalClassName,
}) {
  const onChangeHandler = onChange || (() => {});
  return (
    <textarea
      className={`${styles.customFormTextarea} ${additionalClassName}`}
      onChange={onChangeHandler}
      required={required}
      rows={rows || ""}
      placeholder={placeholder || ""}
      value={value}
    />
  );
}
