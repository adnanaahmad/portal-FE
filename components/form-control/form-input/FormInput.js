import React from "react";
import styles from "./form-input.module.scss";

export default function FormInput({
  id,
  type,
  required,
  value,
  placeholder,
  onChange,
  align,
  name,
  height,
  disableAutoComplete,
  disabled,
  maxLength,
  pattern,
  hidden,
  max,
  min,
  additionalClassName,
}) {
  const onChangeHandler = onChange || (() => {});

  let className = additionalClassName;
  className = [
    className,
    align && align == "center"
      ? [styles.customFormControl, "text-center"].join(" ")
      : styles.customFormControl,
  ].join(" ");

  className = hidden
    ? [className, styles.customHiddenFormControl].join(" ")
    : [className, styles.customNonHiddenFormControl].join(" ");

  const heightValue = height || "2rem";
  let patternObj = pattern ? { pattern } : {};

  if (name) {
    return (
      <input
        id={id}
        type={type || "text"}
        required={required || false}
        value={value || ""}
        name={name}
        className={className}
        placeholder={placeholder || ""}
        autoComplete={disableAutoComplete ? "new-password" : "off"}
        autoSave="off"
        onChange={onChangeHandler}
        style={{ height: heightValue }}
        disabled={disabled}
        maxLength={maxLength}
        max={max}
        min={min}
        {...patternObj}
      />
    );
  }

  return (
    <input
      id={id}
      type={type || "text"}
      required={required || false}
      value={value || ""}
      className={className}
      placeholder={placeholder || ""}
      autoComplete={disableAutoComplete ? "new-password" : "off"}
      autoSave="off"
      onChange={onChangeHandler}
      style={{ height: heightValue }}
      disabled={disabled}
      maxLength={maxLength}
      max={max}
      min={min}
      {...patternObj}
    />
  );
}
