import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { getCardInfo } from "../../../utils/Thunk";
import ClipLoader from "react-spinners/ClipLoader";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Card extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardInfo: {},
      loading: false,
    };
  }

  componentDidMount() {
    this.getCardInfo();
  }

  getCardInfo() {
    const { loading } = this.state;
    if (loading) return;

    this.props.dispatch(
      getCardInfo(
        {},
        () => {
          this.setState({ loading: true });
        },
        (res) => {
          const cardInfo = res && res.info ? res.info : {};
          this.setState({ loading: false, cardInfo });
        }
      )
    );
  }

  renderContent() {
    const { authUser, styles } = this.props;
    const { loading, cardInfo } = this.state;

    if (authUser.role == "admin") {
      return (
        <div className="row">
          <div className="col-md-12">
            <div className={styles.appDashboardCard}>
              <h3>Organization Overview</h3>
              {loading ? (
                <div className={styles.clipLoader}>
                  <ClipLoader color="#0376BC" />
                </div>
              ) : (
                <ul className="list-group list-group-horizontal">
                  <li className="list-group-item">
                    <label>Branches</label>
                    <span>{cardInfo.branches || 0}</span>
                    <Link
                      className={styles.appDashboardLink}
                      to="/app/branches"
                    >
                      View All Branches
                    </Link>
                  </li>
                  <li className="list-group-item">
                    <label>Administrators</label>
                    <span>{cardInfo.admins > 0 ? cardInfo.admins : 0}</span>
                    <Link
                      className={styles.appDashboardLink}
                      to="/app/members?role=admin"
                    >
                      View All Administrators
                    </Link>
                  </li>
                  <li className="list-group-item">
                    <label>Supervisors</label>
                    <span>{cardInfo.supervisors || 0}</span>
                    <Link
                      className={styles.appDashboardLink}
                      to="/app/members?role=supervisor"
                    >
                      View All Supervisors
                    </Link>
                  </li>
                  <li className="list-group-item">
                    <label>Loan Officers</label>
                    <span>{cardInfo.loanofficers || 0}</span>
                    <Link
                      className={styles.appDashboardLink}
                      to="/app/members?role=loanofficer"
                    >
                      View All Loan Officers
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
          {/*
          <div className="col-md-4">
            <div className={styles.appDashboardCard}>
              <h3>Invoice Summary</h3>
              <label>Amount Invoiced Last Month</label>
              <span>$0</span>
              <a className={styles.appDashboardLink}>Download Invoice</a>
              <a className={styles.appDashboardLink}>Pay Now</a>
            </div>
          </div>
          */}
        </div>
      );
    } else if (authUser.role == "supervisor") {
      return (
        <div className="row">
          <div className="col-md-6">
            <div className={styles.appDashboardCard}>
              <div>
                <h3>Branch Supervisors</h3>
                <Link to="/app/members?role=supervisor">
                  View All Supervisors
                </Link>
              </div>
              {loading ? (
                <div className={styles.clipRightLoader}>
                  <ClipLoader color="#0376BC" />
                </div>
              ) : (
                <label>{cardInfo.supervisors || 0}</label>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.appDashboardCard}>
              <div>
                <h3>Loan Officers</h3>
                <Link to="/app/members?role=loanofficer">
                  View All Loan Officers
                </Link>
              </div>
              {loading ? (
                <div className={styles.clipRightLoader}>
                  <ClipLoader color="#0376BC" />
                </div>
              ) : (
                <label>{cardInfo.loanofficers || 0}</label>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  render() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;
    const { role } = authUser;

    return (
      <div className={eval(`this.props.styles.appDashboardPageCards__${role}`)}>
        {this.renderContent()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Card));
