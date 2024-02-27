import React, { Component } from "react";
import { connect } from "react-redux";
import { Prompt, Redirect, withRouter } from "react-router-dom";
import * as Icon from "react-feather";

import {
  BlockAlertComponent,
  GlobalRelativeCanvasComponent,
} from "../../../../components";
import {
  hideCanvas,
  setActiveModal,
  setIndex,
  setNext,
  showAlert,
  showCanvas,
} from "../../../../redux/actions";
import styles from "./applicants.module.scss";
import Helper from "../../../../utils/Helper";
import { submitApplication } from "../../../../utils/Thunk";
import { fieldAcronyms } from "../../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    blockAlertData: state.global.blockAlertData,
    index: Helper.getIndex(state.global),
  };
};

class Applicants extends Component {
  constructor(props) {
    super(props);
    this.state = {
      applicants: [],
      loading: false,
      index: this.props.index,
    };
  }

  onBackButtonEvent = async (e) => {
    e.preventDefault();
    //console.log("onBackButtonEvent", Helper.fetchApplicants().length);
    //await this.props.dispatch(setIndex(-99));
    if (Helper.fetchApplicants().length > 0) {
      if (
        window.confirm(
          "Are you sure you want to leave this page? This will cancel and exit this application."
        )
      ) {
        window.removeEventListener("popstate", this.onBackButtonEvent);
        Helper.removeApplicants();
        this.props.history.replace("/app/applications");
        //this.props.history.push("/");
      } else {
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener("popstate", this.onBackButtonEvent);
      }
      //Helper.removeApplicants();
      //this.props.history.replace("/app/applications");
    }
  };

  componentDidMount() {
    this.props.dispatch(setIndex(-1));
    // SingletonRouter.router.change = (...args) => {
    //   if (confirm("Want to leave?")) {
    //     return Router.prototype.change.apply(SingletonRouter.router, args);
    //   } else {
    //     return new Promise((resolve, reject) => resolve(false));
    //   }
    // };
    //window.addEventListener("beforeunload", this.beforeunload.bind(this));
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", this.onBackButtonEvent);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.onBackButtonEvent);
    //delete SingletonRouter.router.change;
    //window.removeEventListener("beforeunload", this.beforeunload.bind(this));
    // window.addEventListener("beforeunload", function (e) {
    //   // Cancel the event
    //   e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
    //   // Chrome requires returnValue to be set
    //   console.log("beforeunload");
    //   e.returnValue = "";
    // });
  }

  beforeunload() {
    //if (this.props.dataUnsaved) {
    // e.preventDefault();
    // e.returnValue = true;
    //}
  }

  renderAlert() {
    const { blockAlertData } = this.props;
    if (blockAlertData && blockAlertData.type == "applicant")
      return <BlockAlertComponent data={blockAlertData} />;

    return null;
  }

  componentDidUpdate() {
    //window.addEventListener("popstate", this.onBackButtonEvent);
  }

  renderApplicantName(applicant) {
    const pi = applicant.personal_information;
    return `${pi.first_name} ${
      pi.middle_name && pi.middle_name.length > 0 ? pi.middle_name : ""
    } ${pi.last_name}`;
  }

  renderApplicantInfo(applicant, index) {
    return (<span>{this.getApplicantInfo(index)}</span>);
  }

  getApplicantInfo(index) {
    return index === 0 ? "Primary applicant" : `Co-applicant ${index}`;
  }

  renderApplicants() {
    const applicants = Helper.fetchApplicants();

    if (!applicants || !applicants.length) {
      return (
        <div className="app-no-results">
          <h3>No Applicants</h3>
        </div>
      );
    }

    const items = [];
    applicants.forEach((applicant, index) => {
      items.push(
        <li key={`applicant_${index}`}>
          <article>
            <div>
              <b>{this.renderApplicantName(applicant)}</b>
            </div>
            <p>{this.renderApplicantInfo(applicant, index)}</p>
          </article>
          <div>
            {!applicant.submitted ? (
              <a href={""} onClick={this.editApplicant} data-index={index}>
                Edit
              </a>
            ) : (
              <div>Saved</div>
            )}
            {!applicant.submitted && index > 0 && (
              <a
                href={""}
                onClick={this.removeApplicant}
                data-index={index}
                style={{ marginLeft: "1rem" }}
              >
                Remove
              </a>
            )}
          </div>
        </li>
      );
    });

    return <ul>{items}</ul>;
  }

  showApplication = (application) => {
    const { history } = this.props;
    const url = `/app/application/${application.app_id}`;
    //Router.reload(url);
    if (history) {
      this.props.dispatch(setIndex(0));
      history.push(url);
    }
  };

  finalize = () => {
    let primary = Helper.fetchApplicant(0);

    if (Helper.fetchApplicants().length === 1 && primary.app_id) {
      this.showApplication(primary);
      return;
    }

    const params = {
      id: primary.id,
    };

    this.props.dispatch(
      submitApplication(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success && res.application) {
            this.showApplication(res.application);
          }
        }
      )
    );
  };

  doSubmit = (index) => {
    let applicant = Helper.fetchApplicant(index);
    if (applicant) {
      Helper.saveApplication(index, this.props, (res) => {
        if (res && res.success && res.application) {
          applicant.submitted = true;
          applicant.app_id = res.application.app_id;
          applicant.id = res.application.id;
          Helper.updateApplicant(applicant, index);
          this.setState({ last: Date.now() });
          setTimeout(() => {
            this.checkApplicants();
          }, 10);
        } else {
          this.props.dispatch(hideCanvas());
        }
      });
    }
  };

  checkApplicants = () => {
    this.props.dispatch(showCanvas());
    let applicants = Helper.fetchApplicants();
    const error = this.checkUniqueFields(applicants);
    if (error) {
      this.props.dispatch(hideCanvas());
      this.props.dispatch(showAlert(error));
      return;
    }
    let passed = false;
    for (let index = 0; index < applicants.length; index++) {
      const applicant = applicants[index];
      if (!applicant.submitted) {
        passed = false;
        this.doSubmit(index);
        break;
      } else {
        passed = true;
      }
    }

    this.setState({ last: Date.now() });

    if (passed) {
      this.finalize();
    }
  };

  checkUniqueFields = (array) => {
    const fieldMap = {
      email: {},
      ssn: {},
      dl_number: {},
    };
    for (const [index, { personal_information }] of array.entries()) {
      for (const [field, obj] of Object.entries(fieldMap)) {
        if (obj[personal_information[field]])
          return `Duplicate ${fieldAcronyms[field]} in ${this.getApplicantInfo(
            index
          )}: ${personal_information[field]}`;
        obj[personal_information[field]] = true;
      }
    }
    return null;
  };

  submitApp = (e) => {
    e.preventDefault();
    if (Helper.fetchApplicants().length > 1) {
      this.checkApplicants();
    } else {
      this.props.dispatch(setNext(this.checkApplicants));
      this.props.dispatch(setActiveModal("solo-applicant"));
    }
  };

  editApplicant = async (e) => {
    e.preventDefault();
    const index = parseInt(e.target.getAttribute("data-index"));
    //this.setState({ index: index });
    await this.props.dispatch(setIndex(index));

    this.props.history.push(`/app/applicants/${index}/edit`);
  };

  doRemove = (index) => {
    if (index > 0) {
      Helper.removeApplicant(index);
      this.setState({ last: Date.now() });
      this.props.dispatch(setIndex(-1));
    }
  };

  removeApplicant = (e) => {
    e.preventDefault();
    const index = e.target.getAttribute("data-index");
    //TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    this.props.dispatch(setIndex(index));
    this.props.dispatch(setNext(this.doRemove));
    this.props.dispatch(setActiveModal("delete-applicant"));
  };

  newApplicant = async (e) => {
    e.preventDefault();
    const applicants = Helper.fetchApplicants();
    const count = applicants.length;
    const type = applicants[0].type;
    if (type == "Credit Card" && count >= 2) {
      this.props.dispatch(showAlert("You cannot add more co-applicants"));
      return;
    }

    if (type == "Personal Loan" && count >= 2) {
      this.props.dispatch(showAlert("You cannot add more co-applicants"));
      return;
    }

    if (count >= 10) {
      this.props.dispatch(showAlert("You cannot add more co-applicants"));
      return;
    }

    await this.props.dispatch(setIndex(count));
    this.props.history.push({
      pathname: "/app/application/new",
      state: this.state,
    });
  };

  clickCancel = (e) => {
    e.preventDefault();
    this.props.dispatch(setActiveModal("cancel-applicants"));
  };

  renderFooterButtons() {
    return (
      <div className={styles.appNewApplicationPage__buttons}>
        <a
          className={["btn btn-primary", styles.btnAppNewApplicationPage].join(
            " "
          )}
          onClick={this.submitApp}
        >
          Continue to Submit Application
        </a>
      </div>
    );
  }

  render() {
    const { loading } = this.state;
    const count = Helper.fetchApplicants().length;
    const { index } = this.props;

    if (count === 0) return <Redirect to="/app/applications" />;

    return (
      <div className={styles.appApplicantsPage}>
        <div className={styles.appApplicantsPageHeader}>
          <div className={["c-container", styles.cContainer].join(" ")}>
            <Prompt
              when={index < 0}
              message={(location, action) => {
                if (action === "POP" || action === "REPLACE") {
                  return true;
                }
                return `Are you sure you want to leave this page? This will cancel and exit this application.`;
              }}
            />
            <a onClick={this.newApplicant} className="btn btn-icon btn-primary">
              <Icon.Plus size={18} />
              <label>Add Co-applicant</label>
            </a>
            <a id="cancel" onClick={this.clickCancel} className="btn btn-light">
              Cancel
            </a>
          </div>
        </div>

        <div className={["c-container", styles.cContainer].join(" ")}>
          {this.renderAlert()}
          <div className={styles.appApplicantsPage__list}>
            {loading ? (
              <GlobalRelativeCanvasComponent />
            ) : (
              this.renderApplicants()
            )}
          </div>
          {this.renderFooterButtons()}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Applicants));
