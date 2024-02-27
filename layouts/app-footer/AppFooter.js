import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import styles from "./app-footer.module.scss";
import { BUILD_TYPE } from "../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    buildType: state.global.buildType,
  };
};

function AppFooter({ buildType }) {
  return (
    <div className={styles.appFooter}>
      <div className={styles.appFooterInner}>
        <ul>
          <li>
            <a
              target="_blank"
              href={
                buildType === BUILD_TYPE.FUTURE_FAMILY
                  ? "https://fortifid.zendesk.com/hc/en-us/requests/new"
                  : "https://fortifid.zendesk.com/hc/en-us"
              }
              rel="noreferrer"
            >
              Support
            </a>
          </li>
          <li>
            <a
              target="_blank"
              href="https://www.fortifid.com/terms-and-conditions"
              rel="noreferrer"
            >
              Terms &amp; Conditions
            </a>
          </li>
          <li>
            <a href="https://fortifid.com/" target="_blank" rel="noreferrer">
              <img src="/logo.svg" width="111" height="24" alt="" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
export default connect(mapStateToProps)(AppFooter);
