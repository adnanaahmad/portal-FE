import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import Tooltip from "@material-ui/core/Tooltip";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import { setFillDemoData } from "../../../../redux/actions";
import Helper from "../../../../utils/Helper";
import { DEMODATA } from "../../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
  };
};

class Identifier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      app_id: "",
      demoName: "",
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    const { fillDemoData } = this.props;
    if (!prevProps.fillDemoData && fillDemoData) this.generateDemoData();
  }

  generateDemoData() {
    this.setState(
      {
        app_id: "A0000" + Helper.makeAppId(10),
      },
      () => {
        this.setData();
      }
    );
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value }, () => {
      this.setData();
    });
  }

  setData() {
    const { onSetData } = this.props;
    const { app_id } = this.state;
    if (onSetData) {
      onSetData("identifier", {
        app_id,
      });
    }
  }

  fillDemoData = (e) => {
    this.setState({ demoName: e.target.value }, async () => {
      await this.props.dispatch(setFillDemoData(null));
      await this.props.dispatch(setFillDemoData(e.target.value));
    });
    this.resetErrors();
  };

  resetErrors = () => {
    const { onResetErrors } = this.props;
    onResetErrors();
  };

  renderTooltip() {
    return (
      <Fragment>
        <p className="font-size-13">
          The ID is auto-generated and
          <br />
          can be modified if desired.
        </p>
      </Fragment>
    );
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const { app_id } = this.state;
    return (
      <div className={[styles.cDataRow, "mb-3"].join(" ")}>
        <label>Application ID</label>
        <span>{app_id}</span>
      </div>
    );
  }

  // Edit Content
  renderEditContent() {
    const { styles } = this.props;
    const { app_id } = this.state;
    return (
      <div className="row">
        <div className="col-md-4">
          <div className={styles.cFormRow}>
            <label>Application ID</label>
            <div className={styles.cAppIdWrap}>
              <FormInputComponent
                type="text"
                value={app_id}
                onChange={(e) => this.inputField(e, "app_id")}
                disableAutoComplete
              />
              <Tooltip title={this.renderTooltip()} placement="right-end">
                <Icon.Info size={16} color="#142D53" />
              </Tooltip>
            </div>
            <span>Optional</span>
          </div>
        </div>
      </div>
    );
  }

  getDemoOptions() {
    let options = [];
    for (let i in DEMODATA) {
      options[i] = Helper.camelCaseToSpaces(i);
    }
    return options;
  }

  render() {
    const { preview, authUser, styles } = this.props;
    const { demoName } = this.state;

    return (
      <Fragment>
        {!preview && authUser.demo_mode ? (
          <div className={styles.cRow}>
            <div className={styles.cRowLabel}>
              <label></label>
            </div>
            <div className={styles.cRowContent}>
              <div className="row">
                <div className="col-md-4">
                  <div className={styles.cFormRow}>
                    <label>Demo Data</label>
                    <FormSelectComponent
                      value={demoName}
                      onChange={this.fillDemoData}
                      onKeyDown={(e) => this.props.onOptionSelected(e)}
                      required={false}
                      options={this.getDemoOptions()}
                      placeholder="Select..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Identifier));
