import React from "react";
import { BRAND } from "../../utils/Constant";

import styles from "./footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className="font-size-14 font-weight-500">
        &copy;2023 All Rights Reserved. {BRAND}, Inc.
      </p>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://fortifid.zendesk.com/hc/en-us"
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
      </ul>
    </footer>
  );
}
