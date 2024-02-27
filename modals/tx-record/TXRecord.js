/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import IdleTimer from "react-idle-timer";
import DataTable from "react-data-table-component";
import { removeActiveModal, setTXModalApp } from "../../redux/actions";
import { BUILD_TYPE, SCHEMES } from "../../utils/Constant";
import { v4 as uuidv4 } from "uuid";

import styles from "./tx-record.module.scss";
import Helper from "../../utils/Helper";
import { Form } from "react-bootstrap";
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    txModalApp: state.modal.txModalApp,
    authUser: state.global.authUser,
    buildType: state.global.buildType,
  };
};

class TXRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      providerRecords: [],
      ipaddrRecords: [],
      amlRecords: [],
      incomeRecords: [],
      twnRecords: [],
      businessRecords: [],
      scheme: "",
      timeout: 1000 * 60 * 10, //Inactive Timer: 10 minutes
      userLoggedIn: false,
      isChecked: false,
      tempProviderRecords: [],
    };
    this.providerColumns = [];
    this.simpleColumns = [];
    this.normalColumns = [];
    this.idleTimer = null;
    this.onAction = this._onAction.bind(this);
    this.onActive = this._onActive.bind(this);
    this.onIdle = this._onIdle.bind(this);
  }

  _onAction() {
    this.idleTimer.reset();
  }

  _onActive() {
    this.idleTimer.reset();
  }

  _onIdle() {
    if (this.idleTimer.getRemainingTime() <= 0) {
      this.closeModal();
    }
  }

  componentDidMount() {
    const { buildType } = this.props;
    this.providerColumns = [
      {
        name: "Provider",
        cell: (row) => {
          return <label className={styles.txTableCell}>{row.provider}</label>;
        },
        sortable: false,
        compact: true,
      },
      {
        name: "Code",
        cell: (row) => {
          return <label className={styles.txTableCell}>{row.code}</label>;
        },
        sortable: false,
        compact: true,
      },
      {
        name: "Explanation",
        cell: (row) => {
          return <label className={styles.txTableCell}>{row.message}</label>;
        },
        sortable: false,
        compact: true,
      },
      ...(buildType === BUILD_TYPE.FUTURE_FAMILY
        ? [
            {
              name: "Affected Attribute Result",
              cell: (row) => {
                return (
                  <label className={styles.txTableCell}>{row.result}</label>
                );
              },
              sortable: false,
              compact: true,
            },
          ]
        : []),
    ];

    this.simpleColumns = [
      {
        name: "Key",
        cell: (row) => {
          return <label className={styles.txTableCell}>{row.key}</label>;
        },
        sortable: false,
        compact: true,
      },
      {
        name: "Value",
        cell: (row) => {
          return <label className={styles.txTableCell}>{row.value}</label>;
        },
        sortable: false,
        compact: true,
      },
    ];

    this.normalColumns = [
      {
        name: "Code",
        cell: (row) => {
          return <label className={styles.txTableCell}>{row.code}</label>;
        },
        sortable: false,
        compact: true,
      },
      {
        name: "Explanation",
        cell: (row) => {
          return <label className={styles.txTableCell}>{row.message}</label>;
        },
        sortable: false,
        compact: true,
      },
    ];
    this.conditionalRowStyles = [
      {
        when: (row) => row.result,
        style: {
          border: "1px solid red", // Custom styling for the row
        },
      },
    ];

    this.initData();
    this.initValues();

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const closeTXRecordButton = document.getElementById(
          "closeTXRecordButton"
        );
        if (closeTXRecordButton) {
          closeTXRecordButton.click();
        }
      }
    });
  }

  initValues() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return;
    let profile = {};
    if (authUser.role == "admin") profile = authUser.profile;
    else if (authUser.parent_user && authUser.parent_user.profile)
      profile = authUser.parent_user.profile;

    this.setState({ scheme: profile.scheme || "" });
  }

  // Close Modal
  closeModal() {
    this.props.dispatch(setTXModalApp({}));
    this.props.dispatch(removeActiveModal());
  }

  // Trigger Close
  clickClose = (e) => {
    e.preventDefault();
    this.closeModal();
  };

  filterRecords = () => {
    //console.log("state", this.state);
    const { providerRecords, isChecked, tempProviderRecords } = this.state;
    const records = !isChecked
      ? providerRecords.filter((item) => item.result)
      : tempProviderRecords;
    this.setState({
      tempProviderRecords: providerRecords,
      providerRecords: records,
      isChecked: !isChecked,
    });
  };

  // Init Data
  initData() {
    const { txModalApp, buildType } = this.props;
    if (txModalApp.tab == "Consumer Insights") {
      // Consumer Insights Records
      const { consumer_insights, doc_verify } = txModalApp;
      const providerRecords = [];
      const ipaddrRecords = [];
      const amlRecords = [];
      // Data Providers
      if (consumer_insights && consumer_insights.data_providers) {
        const temp = JSON.parse(consumer_insights.data_providers);
        if (temp && temp.length) {
          temp.forEach((item) => {
            const provider =
              buildType === BUILD_TYPE.FUTURE_FAMILY
                ? item.name
                : item.data_provider;
            const details = item.details;
            if (details && details.length) {
              details.forEach((detail) => {
                providerRecords.push({
                  provider,
                  code:
                    buildType === BUILD_TYPE.FUTURE_FAMILY
                      ? detail.code
                      : detail.detail_code,
                  message:
                    buildType === BUILD_TYPE.FUTURE_FAMILY
                      ? detail.message
                      : detail.detail_message,
                });
              });
            }
          });
        }
      }
      if (buildType === BUILD_TYPE.FUTURE_FAMILY) {
        if (consumer_insights && consumer_insights.aml_info) {
          const temp = JSON.parse(consumer_insights.aml_info);
          for (const key in temp) {
            if (temp.hasOwnProperty(key)) {
              const obj = temp[key];
              const perDataProviders = obj.per_data_provider_results;
              const result =
                obj.result === "Not-Verified" ||
                obj.result === "Needs-Review" ||
                obj.result === "Not Verified" ||
                obj.result === "Needs Review"
                  ? `${Helper.formatString(key)}:${Helper.formatString(
                      obj.result
                    )}`
                  : "";
              if (perDataProviders) {
                for (const providerObj of perDataProviders) {
                  const provider = providerObj.data_provider;
                  const details = providerObj.details;
                  if (details) {
                    for (const detail of details) {
                      const { code, message } = detail;
                      providerRecords.push({
                        provider,
                        code,
                        message,
                        result: providerObj.result !== "Verified" ? result : "",
                      });
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        if (consumer_insights && consumer_insights.aml_info) {
          const temp = JSON.parse(consumer_insights.aml_info);
          if (temp && temp.aml_details) {
            const details = temp.aml_details;
            if (details && details.length) {
              details.forEach((detail) => {
                providerRecords.push({
                  provider: "AML",
                  code: detail.detail_code,
                  message: detail.detail_message,
                });
              });
            }
          }
        }
      }

      // Doc Verify Records
      if (buildType === BUILD_TYPE.FUTURE_FAMILY) {
        if (doc_verify && doc_verify.real_transaction_id) {
          const temp = JSON.parse(doc_verify.real_transaction_id);
          for (const providerObj of temp) {
            const provider = providerObj.name;
            const details = providerObj.details;
            if (details) {
              for (const detail of details) {
                const { code, message } = detail;
                providerRecords.push({
                  provider,
                  code,
                  message,
                });
              }
            }
          }
        }
      }

      // IP/Addr Records
      if (consumer_insights && consumer_insights.ipaddr_info) {
        const temp = JSON.parse(consumer_insights.ipaddr_info);
        if (temp) {
          for (let i in temp) {
            ipaddrRecords.push({
              key: i.toString(),
              value: temp[i] ? temp[i].toString() : "",
            });
          }
        }
      }
      // AML Records
      if (consumer_insights && consumer_insights.aml_info) {
        const temp = JSON.parse(consumer_insights.aml_info);
        if (temp) {
          for (let i in temp) {
            let key = i.toString();
            if (key === "aml_match_list") {
              amlRecords.push(
                temp[i] === null ? "None." : JSON.stringify(temp[i], null, 2)
              );
            }
          }
          if (amlRecords.length === 0) {
            amlRecords.push("None.");
          }
        }
      }

      this.setState({ providerRecords, ipaddrRecords, amlRecords });
    } else if (txModalApp.tab == "Income Insights") {
      // Income Insights Records
      const { income_insights } = txModalApp;
      const incomeRecords = [];
      const twnRecords = [];

      // Income Info
      if (income_insights && income_insights.income_info) {
        const temp = JSON.parse(income_insights.income_info);
        if (temp) {
          for (let i in temp) {
            incomeRecords.push({
              key: i.toString(),
              value: temp[i] ? temp[i].toString() : "",
            });
          }
        }
      }

      // TWN Info
      if (income_insights && income_insights.twn_info) {
        const temp = JSON.parse(income_insights.twn_info);
        if (temp && temp.details && temp.details.length) {
          temp.details.forEach((detail) => {
            twnRecords.push({
              code: detail.detail_code,
              message: detail.detail_message,
            });
          });
        }
      }

      this.setState({ incomeRecords, twnRecords });
    } else {
      // Business Insights Records
      const { business_insights } = txModalApp;
      const businessRecords = [];

      if (business_insights && business_insights.details) {
        const details = JSON.parse(business_insights.details);
        if (details && details.length) {
          details.forEach((detail) => {
            businessRecords.push({
              code: detail.detail_code,
              message: detail.detail_message,
            });
          });
        }
      }

      this.setState({ businessRecords });
    }
  }

  // Render Modal Content
  renderContent() {
    const { scheme, isChecked } = this.state;
    const { authUser, txModalApp, buildType } = this.props;

    const {
      providerRecords,
      ipaddrRecords,
      amlRecords,
      incomeRecords,
      twnRecords,
      businessRecords,
    } = this.state;
    if (txModalApp.tab == "Consumer Insights") {
      const { consumer_insights, mfa, doc_verify, status, created_at } =
        txModalApp;
      return (
        <Fragment>
          <p className="mt-2" style={{ color: SCHEMES[scheme] }}>
            <b>
              FortifID Transaction ID:{" "}
              {consumer_insights?.m_request_id || "Not Available"}
            </b>
          </p>
          {buildType !== BUILD_TYPE.FUTURE_FAMILY && authUser.demo_mode && (
            <>
              <p className="mt-2">
                <b>Equifax Transaction ID: {uuidv4()}</b>
              </p>
              <p className="mt-2">
                <b>Neustar Transaction ID: {uuidv4()}</b>
              </p>
              <p className="mt-2">
                <b>SambaSafety Transaction ID: {uuidv4()}</b>
              </p>
            </>
          )}
          {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
            <React.Fragment>
              {mfa && mfa.transaction_id ? (
                <p className="mt-2">
                  <b>MFA Transaction ID: {mfa.transaction_id}</b>
                </p>
              ) : null}
              {doc_verify && doc_verify.reference_transaction_id ? (
                <p className="mt-2">
                  <b>
                    Doc Transaction ID: {doc_verify.reference_transaction_id}
                  </b>
                </p>
              ) : null}
              <p className="mt-2">
                <b>
                  App ID:{" "}
                  {Helper.stripOrgId(txModalApp.app_id, txModalApp.parent) ||
                    "Not Available"}
                </b>
              </p>
            </React.Fragment>
          )}

          {buildType === BUILD_TYPE.FUTURE_FAMILY && (
            <React.Fragment>
              {consumer_insights && consumer_insights.m_requester_reference ? (
                <p className="mt-2">
                  <b>
                    Request Reference: {consumer_insights.m_requester_reference}
                  </b>
                </p>
              ) : null}
              <p className="mt-2">
                <b>Verification Status: {status}</b>
              </p>
              <p className="mt-2">
                <b>
                  Date Created: {moment(created_at).format("M/D/YYYY h:mm A")}
                </b>
              </p>
            </React.Fragment>
          )}
          <p className="mt-4">
            <b>Providers Data:</b>
          </p>
          {buildType === BUILD_TYPE.FUTURE_FAMILY && (
            <Form>
              <Form.Check
                type="switch"
                id="custom-switch"
                label="Filter Records"
                checked={isChecked}
                onChange={this.filterRecords}
              />
            </Form>
          )}
          <div className={styles.tableWrapper}>
            <DataTable
              columns={this.providerColumns}
              data={providerRecords}
              sortServer={false}
              responsive
              noHeader
              striped={true}
              persistTableHead
              pagination={false}
              paginationServer={false}
              conditionalRowStyles={this.conditionalRowStyles}
            />
          </div>
          {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
            <React.Fragment>
              <p className="mt-4">
                <b>IP / Address Info:</b>
              </p>
              <div className={styles.tableWrapper}>
                <DataTable
                  columns={this.simpleColumns}
                  data={ipaddrRecords}
                  sortServer={false}
                  responsive
                  noHeader
                  striped={true}
                  persistTableHead
                  pagination={false}
                  paginationServer={false}
                />
              </div>
              <p className="mt-4">
                <b>AML Match List:</b>
              </p>
              {amlRecords[0] ? (
                <div className={styles.jsonBox}>
                  <pre>
                    <code>{amlRecords[0]}</code>
                  </pre>
                </div>
              ) : null}
            </React.Fragment>
          )}
        </Fragment>
      );
    } else if (txModalApp.tab == "Income Insights") {
      const { income_insights } = txModalApp;
      return (
        <Fragment>
          {income_insights ? (
            <p className="mt-2" style={{ color: SCHEMES[scheme] }}>
              <b>
                FortifID Transaction ID:{" "}
                {income_insights.m_request_id || "Not Available"}
              </b>
            </p>
          ) : null}
          {authUser.demo_mode && (
            <>
              <p className="mt-2">
                <b>Equifax Transaction ID : {uuidv4()}</b>
              </p>
              <p className="mt-2">
                <b>DirectID Transaction ID: {uuidv4()}</b>
              </p>
            </>
          )}
          <p className="mt-2">
            <b>
              App ID:{" "}
              {Helper.stripOrgId(txModalApp.app_id, txModalApp.parent) ||
                "Not Available"}
            </b>
          </p>
          <p className="mt-4">
            <b>DirectID Result:</b>
          </p>
          {income_insights ? (
            <div className={styles.jsonBox}>
              {income_insights.directid_result || "Not Available"}
            </div>
          ) : null}

          <p className="mt-4">
            <b>Income Info:</b>
          </p>
          <div className={styles.tableWrapper}>
            <DataTable
              columns={this.simpleColumns}
              data={incomeRecords}
              sortServer={false}
              responsive
              noHeader
              striped={true}
              persistTableHead
              pagination={false}
              paginationServer={false}
            />
          </div>
          <p className="mt-4">
            <b>TWN Info:</b>
          </p>
          <div className={styles.tableWrapper}>
            <DataTable
              columns={this.normalColumns}
              data={twnRecords}
              sortServer={false}
              responsive
              noHeader
              striped={true}
              persistTableHead
              pagination={false}
              paginationServer={false}
            />
          </div>
        </Fragment>
      );
    } else {
      const { business_insights } = txModalApp;
      return (
        <Fragment>
          <p className="mt-2" style={{ color: SCHEMES[scheme] }}>
            <b>
              FortifID Transaction ID:{" "}
              {business_insights && business_insights.m_request_id
                ? business_insights.m_request_id
                : "Not Available"}
            </b>
          </p>
          {authUser.demo_mode ? (
            <p className="mt-2">
              <b>Equifax Transaction ID: {uuidv4()}</b>
            </p>
          ) : null}
          <p className="mt-2">
            <b>
              App ID:{" "}
              {Helper.stripOrgId(txModalApp.app_id, txModalApp.parent) ||
                "Not Available"}
            </b>
          </p>
          <p className="mt-2">
            <b>
              Result:{" "}
              {business_insights && business_insights.result
                ? business_insights.result
                : ""}
            </b>
          </p>
          <p className="mt-4">
            <b>Details:</b>
          </p>
          <div className={styles.tableWrapper}>
            <DataTable
              columns={this.normalColumns}
              data={businessRecords}
              sortServer={false}
              responsive
              noHeader
              striped={true}
              persistTableHead
              pagination={false}
              paginationServer={false}
            />
          </div>
        </Fragment>
      );
    }
  }

  render() {
    const { txModalApp } = this.props;
    if (!txModalApp || !txModalApp.id) return null;

    return (
      <div>
        {/*If the browser is inactive for over 30 minutes, the TXRecord window will be closed.*/}
        <IdleTimer
          ref={(ref) => {
            this.idleTimer = ref;
          }}
          element={document}
          onActive={this.onActive}
          onIdle={this.onIdle}
          onAction={this.onAction}
          debounce={250}
          timeout={this.state.timeout}
        />

        <div className={styles.txRecordModal}>
          <div className={styles.txRecordModal__close__buttons}>
            <a
              className={[
                "btn btn-light btn-sm",
                styles.btnTxRecordModalClose,
              ].join(" ")}
              onClick={this.clickClose}
            >
              &times;
            </a>
          </div>
          <h3>Transaction Record</h3>
          <p className="mt-3">
            <b>Type: {txModalApp.tab}</b>
          </p>
          {this.renderContent()}
          <div className={styles.txRecordModal__buttons}>
            <a
              id="closeTXRecordButton"
              className={["btn btn-light", styles.btnTxRecordModal].join(" ")}
              onClick={this.clickClose}
            >
              Close
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(TXRecord));
