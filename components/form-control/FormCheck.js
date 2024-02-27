import React from "react";
import styles from "./form-input/form-input.module.scss";

export default function FormCheck({
  id,
  checked,
  text,
  onChange,
  required,
  additionalClassName,
}) {
  const onChangeHandler = onChange || (() => {});
  return (
    <div
      className={[
        styles.customFormControl,
        styles.customFormControlCheckbox,
      ].join(" ")}
    >
      <input
        type="checkbox"
        id={id || ""}
        checked={checked || false}
        onChange={onChangeHandler}
        required={required || false}
        className={styles[additionalClassName] || ""}
      />
      <label htmlFor={id || ""}>{text}</label>
    </div>
  );
}
