/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Dropzone from "react-dropzone";
import {
  BlockAlertComponent,
  FormInputComponent,
  FormSelectComponent,
} from "../../../components";
import {
  setBlockAlertData,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../../redux/actions";
import { updateSettings, uploadFile } from "../../../utils/Thunk";
import { AppSettingsMenu } from "../../../layouts";
import { BUILD_TYPE, SCHEMES, TIMEZONES } from "../../../utils/Constant";
import {
  cityRegex,
  stateRegex,
  streetAddressRegex,
  aptSuiteNumberRegex,
} from "../../../utils/Regex";

import styles from "./settings.module.scss";
import Helper from "../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    blockAlertData: state.global.blockAlertData,
    authUser: state.global.authUser,
    buildType: state.global.buildType,
  };
};
const SCROLL_THRESHOLD = 96.2;

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      company: "",
      city: "",
      state: "",
      zip: "",
      address: "",
      address_option: "",
      default_timezone: "",
      scheme: "",
      logo: null,
      preview: "",
      decisionWebhookUrl: "",
    };
    this.parentRef = React.createRef(null);
  }

  componentDidMount() {
    this.initValues();

    const companyField = document.getElementById("companyField");
    if (companyField) {
      companyField.focus();
    }

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        this.clickOnDefaultButton();
      }
    });
  }

  initValues() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return;
    let profile = {};
    //TODO?
    if (
      authUser.role == "admin" &&
      (!authUser.parent_user || !authUser.parent_user.profile)
    ) {
      profile = authUser.profile;
    } else if (authUser.parent_user && authUser.parent_user.profile)
      profile = authUser.parent_user.profile;

    this.setState({
      company: profile.company || "",
      city: profile.city || "",
      state: profile.state || "",
      zip: profile.zip || "",
      address: profile.address || "",
      address_option: profile.address_option || "",
      default_timezone: profile.default_timezone || "",
      scheme: profile.scheme || "",
      preview: profile.logo_path,
      decisionWebhookUrl: profile.decision_webhook_url || "",
    });
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  setLogo = (files) => {
    const maxSize = 1024 * 1024 * 1; // 1MB
    if (files && files.length) {
      let file = files[0];
      if (file.size > maxSize) {
        this.props.dispatch(showAlert("Image size should not exceed 1 MB"));
        return;
      }
      const preview = URL.createObjectURL(file);
      this.setState({ logo: file, preview });
      this.focusOnDefault();
    }
  };

  handleKeyDown = (e) => {
    // `Enter` key is pressed
    if (e.keyCode == 13) {
      e.preventDefault();
      this.clickOnDefaultButton();
    }
  };

  renderAlert() {
    const { blockAlertData } = this.props;
    if (blockAlertData && blockAlertData.type == "setting")
      return <BlockAlertComponent data={blockAlertData} />;

    return null;
  }

  scrollToElement(elementRef) {
    elementRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  submit = (e) => {
    const updateSettingsButton = this.getUpdateSettingsButton();
    if (updateSettingsButton) {
      updateSettingsButton.disabled = true;
    }

    e.preventDefault();
    const {
      company,
      city,
      state,
      zip,
      address,
      address_option,
      default_timezone,
      logo,
      scheme,
      preview,
      decisionWebhookUrl,
    } = this.state;
    const { authUser } = this.props;

    if (!authUser || !authUser.id) return;

    if (!company.trim()) {
      this.props.dispatch(showAlert("Please input company"));
      if (updateSettingsButton) {
        updateSettingsButton.disabled = false;
      }
      return;
    }

    if (!address.trim()) {
      this.props.dispatch(showAlert("Please input street address"));
      if (updateSettingsButton) {
        updateSettingsButton.disabled = false;
      }
      return;
    }

    if (!city.trim()) {
      this.props.dispatch(showAlert("Please input city"));
      if (updateSettingsButton) {
        updateSettingsButton.disabled = false;
      }
      return;
    }

    if (!state.trim()) {
      this.props.dispatch(showAlert("Please input state"));
      if (updateSettingsButton) {
        updateSettingsButton.disabled = false;
      }
      return;
    }

    if (!zip.trim()) {
      this.props.dispatch(showAlert("Please input zip code"));
      if (updateSettingsButton) {
        updateSettingsButton.disabled = false;
      }
      return;
    }

    if (!default_timezone.trim()) {
      this.props.dispatch(showAlert("Please select default timezone"));
      if (updateSettingsButton) {
        updateSettingsButton.disabled = false;
      }
      return;
    }

    const params = {
      company: company.trim(),
      address: address.trim(),
      address_option: address_option.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      default_timezone: default_timezone.trim(),
      scheme: scheme.trim(),
      decision_webhook_url: decisionWebhookUrl.trim(),
    };

    this.props.dispatch(
      updateSettings(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          if (res && res.success) {
            const formData = new FormData();
            if (logo) {
              formData.append("file", logo);
              formData.append("name", logo.name);
            } else if (preview) formData.append("name", preview);

            this.props.dispatch(
              uploadFile(
                formData,
                () => {},
                () => {
                  this.props.dispatch(hideCanvas());
                  // Check if the user has scrolled beyond a certain threshold
                  if (document.documentElement.scrollTop > SCROLL_THRESHOLD) {
                    this.scrollToElement(this.parentRef);
                  }

                  this.props.dispatch(
                    setBlockAlertData({
                      message: `Settings have been updated`,
                      color: "success",
                      type: "setting",
                    })
                  );
                }
              )
            );

            if (updateSettingsButton) {
              updateSettingsButton.disabled = false;
            }
          } else {
            this.props.dispatch(hideCanvas());
            if (updateSettingsButton) {
              updateSettingsButton.disabled = false;
            }
          }
        }
      )
    );
  };

  getUpdateSettingsButton() {
    return document.getElementById("updateSettingsButton");
  }

  clickOnDefaultButton() {
    const updateSettingsButton = this.getUpdateSettingsButton();
    if (updateSettingsButton) {
      updateSettingsButton.click();
    }
  }

  focusOnDefault() {
    const updateSettingsButton = this.getUpdateSettingsButton();
    if (updateSettingsButton) {
      updateSettingsButton.focus();
    }
  }

  onSchemeSelected = (e, i) => {
    this.setState({ scheme: i });
    this.focusOnDefault();
  };

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  renderSchemes() {
    const { authUser } = this.props;
    const { scheme } = this.state;

    if (authUser.role == "admin") {
      const items = [];
      for (let i in SCHEMES) {
        items.push(
          <li
            id={`scheme_${i}`}
            className={scheme == i ? styles.active : ""}
            key={`scheme_${i}`}
            style={{ backgroundColor: SCHEMES[i] }}
            onClick={(e) => this.onSchemeSelected(e, i)}
          ></li>
        );
      }
      return items;
    } else {
      if (!scheme) return null;
      return <li style={{ backgroundColor: SCHEMES[scheme] }}></li>;
    }
  }

  render() {
    const { authUser, history, buildType } = this.props;
    const {
      company,
      city,
      state,
      zip,
      address,
      address_option,
      default_timezone,
      preview,
      decisionWebhookUrl,
    } = this.state;

    if (!authUser || !authUser.id) return null;

    return (
      <div className={styles.appSettingsPage}>
        {authUser.role != "loanofficer" ? <AppSettingsMenu /> : null}
        <div className="c-container small" ref={this.parentRef}>
          {this.renderAlert()}
          <h2 className="mb-4">Settings</h2>

          <form
            id="settingsForm"
            action=""
            method="POST"
            onSubmit={this.submit}
          >
            <h3 className="mb-3">Organization Details</h3>

            <div className={styles.cFormRow}>
              <label>Name</label>
              {authUser.role == "admin" ? (
                <FormInputComponent
                  id="companyField"
                  type="text"
                  maxLength={64}
                  value={company}
                  onChange={(e) => this.inputField(e, "company")}
                  height="40px"
                  required={true}
                />
              ) : (
                <p>
                  <b>{company}</b>
                </p>
              )}
            </div>
            <div className="row">
              <div className="col-md-8">
                <div className={styles.cFormRow}>
                  <label>Street Address</label>
                  {authUser.role == "admin" ? (
                    <FormInputComponent
                      type="text"
                      value={address}
                      onChange={(e) => this.inputField(e, "address")}
                      height="40px"
                      required={true}
                      pattern={streetAddressRegex.source}
                    />
                  ) : (
                    <p>
                      <b>{address}</b>
                    </p>
                  )}
                </div>
              </div>
              <div className="col-md-4">
                <div className={styles.cFormRow}>
                  <label>Suite, Unit, Floor, etc.</label>
                  {authUser.role == "admin" ? (
                    <Fragment>
                      <FormInputComponent
                        type="text"
                        value={address_option}
                        onChange={(e) => this.inputField(e, "address_option")}
                        height="40px"
                        pattern={aptSuiteNumberRegex.source}
                      />
                      <span>Optional</span>
                    </Fragment>
                  ) : (
                    <p>
                      <b>{address_option}</b>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <div className={styles.cFormRow}>
                  <label>City</label>
                  {authUser.role == "admin" ? (
                    <FormInputComponent
                      type="text"
                      value={city}
                      onChange={(e) => this.inputField(e, "city")}
                      height="40px"
                      required={true}
                      pattern={cityRegex.source}
                    />
                  ) : (
                    <p>
                      <b>{city}</b>
                    </p>
                  )}
                </div>
              </div>
              <div className="col-md-4">
                <div className={styles.cFormRow}>
                  <label>State</label>
                  {authUser.role == "admin" ? (
                    <FormSelectComponent
                      value={state}
                      onChange={(e) => this.inputField(e, "state")}
                      options={Helper.getStateOptions()}
                      placeholder="Select a State"
                      height="40px"
                      required={true}
                    />
                  ) : (
                    <p>
                      <b>{state}</b>
                    </p>
                  )}
                </div>
              </div>
              <div className="col-md-4">
                <div className={styles.cFormRow}>
                  <label>ZIP Code</label>
                  {authUser.role == "admin" ? (
                    <FormInputComponent
                      type="text"
                      value={zip}
                      onChange={(e) => this.inputField(e, "zip")}
                      height="40px"
                      required={true}
                      pattern="^[0-9]{5}$"
                    />
                  ) : (
                    <p>
                      <b>{zip}</b>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.cFormRow}>
              <label>Default Time Zone</label>
              <div className="row">
                <div className="col-md-8">
                  {authUser.role == "admin" ? (
                    <FormSelectComponent
                      value={default_timezone}
                      options={TIMEZONES}
                      onChange={(e) => this.inputField(e, "default_timezone")}
                      onKeyDown={this.handleKeyDown}
                      height="40px"
                      required={true}
                      placeholder="Select a timezone..."
                    />
                  ) : (
                    <p>
                      <b>{TIMEZONES[default_timezone]}</b>
                    </p>
                  )}
                </div>
              </div>
              {authUser.role == "admin" ? (
                <small>{`This will be set as the default time zone for new Members added to your organization. Changing this will not affect member’s time zone which can be defined in each member’s profile.`}</small>
              ) : null}
            </div>
            {buildType === BUILD_TYPE.FUTURE_FAMILY && (
              <div className="col-md-8">
                <div className={styles.cFormRow}>
                  <label>Webhook Url</label>
                  {authUser.role == "admin" ? (
                    <FormInputComponent
                      value={decisionWebhookUrl}
                      onChange={(e) => this.inputField(e, "decisionWebhookUrl")}
                      placeholder=""
                      height="40px"
                      required={false}
                    />
                  ) : (
                    <p>
                      <b>{decisionWebhookUrl}</b>
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="spacer mb-4"></div>
            <h3 className="mb-3">Branding</h3>

            <div className={styles.logoBox}>
              <label>Logo</label>
              {authUser.role == "admin" ? (
                <div>
                  <Dropzone
                    accept="image/jpeg, image/png, image/jpg, image/gif"
                    multiple={false}
                    onDrop={this.setLogo}
                    //maxSize={1024 * 1024 * 5}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <section className={styles.cDropzone}>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p>Drag an image here</p>
                          <label>or</label>
                          <a className="btn btn-primary-outline btn-small">
                            Upload an image
                          </a>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                  <p>{`Your logo will be displayed on the top left corner. For best result, please make sure your logo image is at least 300 pixels wide. Logos may be JPG, GIF, or PNG images under 1 MB in size.`}</p>
                </div>
              ) : null}
              {preview ? (
                <article>
                  <img src={preview} alt="" />
                  {authUser.role == "admin" ? (
                    <a
                      onClick={() => this.setState({ logo: null, preview: "" })}
                    >
                      Remove File
                    </a>
                  ) : null}
                </article>
              ) : null}
            </div>

            <div className={styles.colorThemeBox}>
              <label>Color Scheme</label>
              <ul>{this.renderSchemes()}</ul>
            </div>

            {authUser.role == "admin" ? (
              <Fragment>
                <div className="spacer mt-4 mb-4"></div>
                <div className={styles.appSettingsPage__buttons}>
                  <button
                    id="updateSettingsButton"
                    type="submit"
                    className={[
                      "btn btn-primary",
                      styles.btnAppSettingsPage,
                    ].join(" ")}
                  >
                    Update Settings
                  </button>
                  <a
                    className={[
                      "btn btn-light",
                      styles.btnAppSettingsPage,
                    ].join(" ")}
                    onClick={() => history.push("/app")}
                  >
                    Cancel
                  </a>
                </div>
              </Fragment>
            ) : null}
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Settings));
