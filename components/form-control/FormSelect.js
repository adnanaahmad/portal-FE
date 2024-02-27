import React from "react";
import styles from "./form-input/form-input.module.scss";

export default function FormSelect({
  required,
  value,
  placeholder,
  onChange,
  onKeyDown,
  options,
  height,
  additionalClassName,
}) {
  const heightValue = height || "2rem";
  const onChangeHandler = onChange || (() => {});
  const onKeyDownHandler = onKeyDown || (() => {});
  const selectOptions = [];
  if (options) {
    let index = 0;
    for (let i in options) {
      selectOptions.push(
        <option value={i} key={"option_" + index++}>
          {options[i]}
        </option>
      );
    }
  }

  return (
    <select
      className={[styles.customFormControl, additionalClassName].join(" ")}
      onChange={onChangeHandler}
      onKeyDown={onKeyDownHandler}
      required={required || false}
      value={value || ""}
      style={{ height: heightValue }}
    >
      <option value="">{placeholder}</option>
      {selectOptions}
    </select>
  );
}
