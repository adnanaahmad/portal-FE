import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import { setBlockAlertData } from "../../redux/actions";

import styles from "./block-alert.module.scss";

const mapStateToProps = () => {
  return {};
};

class BlockAlert extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.close();
    }, 5000);
  }

  close() {
    this.props.dispatch(setBlockAlertData({}));
  }

  renderIcon() {
    const { data } = this.props;
    const { color } = data;

    if (color == "success")
      return (
        <div className={styles.cBlockAlert__icon}>
          <Icon.Check />
        </div>
      );
    else if (color == "info")
      return (
        <div className={styles.cBlockAlert__icon}>
          <Icon.AlertCircle />
        </div>
      );
    else if (color == "warning")
      return (
        <div className={styles.cBlockAlert__icon}>
          <Icon.AlertTriangle />
        </div>
      );
    else if (color == "danger")
      return (
        <div className={styles.cBlockAlert__icon}>
          <Icon.AlertOctagon />
        </div>
      );
    return null;
  }
  render() {
    const { data, customClass } = this.props;
    if (!data || !data.color || !data.message) return null;

    let statusClassName;
    switch (data.color) {
      case "info": {
        statusClassName = styles.info;
        break;
      }
      case "warning": {
        statusClassName = styles.warning;
        break;
      }
      case "danger": {
        statusClassName = styles.danger;
        break;
      }
      default: {
        statusClassName = styles.success;
      }
    }

    return (
      <div
        className={[styles.cBlockAlert, customClass, statusClassName].join(" ")}
      >
        {this.renderIcon()}
        <p>{data.message}</p>
        <div
          className={styles.cBlockAlert__closeIcon}
          onClick={() => this.close()}
        >
          <Icon.X />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(BlockAlert);
