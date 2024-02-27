/* eslint-disable react/no-unknown-property */
import React, { Component } from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Head from "next/head";
import IdleTimer from "react-idle-timer";
import { GlobalLayout } from "../layouts";
import { Routes } from "../routes";
import Helper from "../utils/Helper";
import {
  saveUser,
  setActiveModal,
  removeActiveModal,
  setReloadForNewVersionData,
  setBuildType,
} from "../redux/actions";
import { getConfig } from "../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class App extends Component {
  componentDidMount() {
    this.checkForNewBuildVersion();
    this.setBuildType();
  }

  setBuildType() {
    this.props.dispatch(setBuildType(process.env.NEXT_PUBLIC_BUILD_TYPE));
  }

  checkForNewBuildVersion() {
    this.props.dispatch(
      getConfig(
        "front",
        () => {},
        (res) => {
          if (res) {
            if (
              res.version &&
              process.env.NEXT_PUBLIC_VERSION !== res.version
            ) {
              this.props.dispatch(
                setReloadForNewVersionData({
                  buildVersion: res.version,
                })
              );

              this.props.dispatch(setActiveModal("reload-for-new-version"));
            }
          }
        },
        true
      )
    );
  }

  handleOnActive = () => {
    //
  };

  closeModal() {
    this.props.dispatch(removeActiveModal());
  }

  handleOnIdle = () => {
    const { authUser } = this.props;
    if (authUser && authUser.id) {
      this.closeModal();
      Helper.storeUser({});
      this.props.dispatch(saveUser({}));
      this.checkForNewBuildVersion();
    }
  };

  render() {
    return (
      <div id="app">
        <Head>
          <title>FortifID</title>
          <meta
            name="viewport"
            content="width=device-width, minimum-scale=1.0, maximum-scale = 1.0, user-scalable = no"
          />
          <link rel="icon" href="/fav_32.png" sizes="32x32" />
          <link rel="icon" href="/fav_192.png" sizes="192x192" />
          <link
            rel="preload"
            href="/fonts/poppins/poppins-bold-webfont.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/poppins/poppins-light-webfont.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/poppins/poppins-regular-webfont.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/poppins/poppins-medium-webfont.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/poppins/poppins-semibold-webfont.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
        </Head>

        <IdleTimer
          timeout={1000 * 60 * 30}
          onActive={this.handleOnActive}
          onIdle={this.handleOnIdle}
        />

        <Router
        // getUserConfirmation={(message, callback) => {
        //   // this is the default behavior
        //   const allowTransition = window.confirm(message);
        //   callback(allowTransition);
        // }}
        >
          <GlobalLayout />

          <Switch>
            <Route path="/" component={Routes} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
