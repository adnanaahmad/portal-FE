import React, { Component, Fragment } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import * as Icon from "react-feather";

import styles from "./verification-item.module.scss";

class VerificationItem extends Component {
  render() {
    const { title, content } = this.props;
    const { message, code, status } = content;

    return (
      <div className={styles.verificationItem}>
        <div className={styles.verificationItemHeader}>
          <span>
            {!code && !message ? (
              <div />
            ) : status == "loading" ? (
              <ClipLoader size={16} color="#0376BC" />
            ) : status == "success" ? (
              <Icon.Check size={16} color="#42C27D" />
            ) : status == "fail" ? (
              <Icon.X size={16} color="#DE4A0B" />
            ) : (
              <div />
            )}
          </span>
          <label>{title}</label>
        </div>
        {message || code ? (
          <div className={styles.verificationItemBody}>
            {message ? <p>{message}</p> : null}
            {code ? (
              <Fragment>
                <p className="mt-1">{code}</p>
              </Fragment>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

export default VerificationItem;
