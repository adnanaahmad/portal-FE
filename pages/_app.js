import React, { useEffect } from "react";
import { Provider } from "react-redux";

import store from "../redux/store";
import "../styles/app.scss";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const handleKeyPress = (event) => {
      const isModalOpen =
        document.getElementsByClassName("custom-modals").length > 0 ? 1 : 0;

      // `Enter` key is pressed and input search element is not in focus
      if (
        event.keyCode === 13 &&
        !isModalOpen &&
        document.activeElement.tagName !== "INPUT"
      ) {
        const defaultAction = document.querySelector('[custom-type="default"]');
        if (defaultAction) {
          if (defaultAction.href) {
            window.location.href = defaultAction.href;
          }
        }
      }
    };

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  });

  return (
    <Provider store={store}>
      <div id="app-wrapper" suppressHydrationWarning>
        {typeof window === "undefined" ? null : <Component {...pageProps} />}
      </div>
    </Provider>
  );
}

export default MyApp;
