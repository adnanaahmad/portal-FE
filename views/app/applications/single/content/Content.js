import React, { Component } from "react";
import { connect } from "react-redux";
import ConsumerInsights from "../tabs/consumer-insights/ConsumerInsights";
import IncomeInsights from "../tabs/income-insights/IncomeInsights";
import BusinessInsights from "../tabs/business-insights/BusinessInsights";

import styles from "./content.module.scss";
import Helper from "../../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class Content extends Component {
  // Render Consumer Insights Status
  renderConsumerInsightsStatus() {
    const { application } = this.props;
    const action = Helper.getConsumerInsightsStatus(application);

    return this.renderActionTag(action);
  }

  // Render Income Insights Status
  renderIncomeInsightsStatus() {
    const { application } = this.props;
    const action = Helper.getIncomeInsightsStatus(application);

    return this.renderActionTag(action);
  }

  // Render Business Insights Status
  renderBusinessInsightsStatus() {
    const { application } = this.props;
    const action = Helper.getBusinessInsightsStatus(application);

    return this.renderActionTag(action);
  }

  renderActionTag(action) {
    let titles = {
      verified: "Verified",
      "not verified": "Not Verified",
      "needs review": "Needs Review",
      required: "Action Required",
      expired: "Expired",
      "-": "Action Required",
    };
    return <span className="d-block font-size-13">{titles[action]}</span>;
  }

  clickTab(key) {
    if (this.getClassName(key) == styles.disable) return;

    const { onClickTab } = this.props;
    if (onClickTab) onClickTab(key);
  }

  getClassName(key) {
    const { tab, application } = this.props;
    if (
      key == "Income Insights" &&
      Helper.getConsumerInsightsStatus(application) == "not verified"
    ) {
      return tab === key ? styles.active : "";
    } else if (
      key == "Small Business Insights" &&
      (Helper.getConsumerInsightsStatus(application) == "not verified" ||
        Helper.getIncomeInsightsStatus(application) == "not verified")
    ) {
      return tab === key ? styles.active : "";
    }
    if (tab == key) return styles.active;
    return styles.ready;
  }

  renderMenu() {
    const { application } = this.props;
    return (
      <ul>
        <li
          onClick={() => this.clickTab("Consumer Insights")}
          className={this.getClassName("Consumer Insights")}
        >
          <label className="d-block font-size-14 font-weight-600">
            Consumer Insights
          </label>
          {this.renderConsumerInsightsStatus()}
        </li>
        <li
          onClick={() => this.clickTab("Income Insights")}
          className={this.getClassName("Income Insights")}
        >
          <label className="font-size-14 font-weight-600">
            Income Insights
          </label>
          {this.renderIncomeInsightsStatus()}
        </li>
        {application.type == "Small Business Loan" ? (
          <li
            onClick={() => this.clickTab("Small Business Insights")}
            className={this.getClassName("Small Business Insights")}
          >
            <label className="font-size-14 font-weight-600">
              Small Business Insights
            </label>
            {this.renderBusinessInsightsStatus()}
          </li>
        ) : null}
      </ul>
    );
  }

  renderContent() {
    const { tab } = this.props;
    const { application, onRefresh } = this.props;

    if (tab == "Consumer Insights")
      return (
        <ConsumerInsights application={application} onRefresh={onRefresh} />
      );
    else if (tab == "Income Insights")
      return <IncomeInsights application={application} onRefresh={onRefresh} />;
    else if (tab == "Small Business Insights")
      return (
        <BusinessInsights application={application} onRefresh={onRefresh} />
      );
    return null;
  }

  render() {
    const { application } = this.props;
    if (!application || !application.id) return null;

    return (
      <div className={styles.appSingleApplicationPageContent}>
        {this.renderMenu()}
        <section>{this.renderContent()}</section>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Content);
