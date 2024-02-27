import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  removeActiveModal,
  setJSONEditorData,
} from "../../redux/actions";
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

import styles from "./json-editor.module.scss";

const mapStateToProps = (state) => {
  return {
    JSONEditor: state.modal.JSONEditor,
  };
};

class JSONEditor extends Component {

  constructor(props) {

    super(props);
    this.state = {
      file: this.props.JSONEditor.file,
    };

  }

  clickCancel = (e) => {

    e.preventDefault();
    this.props.dispatch(removeActiveModal());

  }

  clickSave = (e) => {

    this.clickCancel(e);

    this.props.dispatch(
      setJSONEditorData({
        file: this.state.file,
      })
    );

  };

  onFileChange = (arg) => {

    if(arg.jsObject) {

      this.setState({ file: arg.jsObject });

    }

  }

  render() {

    const { file } = this.state;

    return (
      <div className={styles.JSONEditorModal}>
        <div className={styles.jsonEditorModal__close__buttons}>
          <a
            className={[
              "btn btn-light btn-sm",
              styles.btnJSONEditorModalClose,
            ].join(" ")}
            onClick={this.clickCancel}
          >
            &times;
          </a>
        </div>
        <h3>JSON Editor</h3>
        <p className="mt-4">
          Edit your JSON file below:
        </p>
        <JSONInput
          placeholder={file}
          theme="light_mitsuketa_tribute"
          locale={locale}
          colors={{
            string: "#DAA520",
            background: "#222222"
          }}
          width="808"
          onChange={this.onFileChange}
        />
        <div className={styles.JSONEditorModal__button}>
          <a
            className={[
              "btn btn-primary",
              styles.btnJSONEditorModal
            ].join(" ")}
            onClick={this.clickSave}
          >
            Save
          </a>
          <a
            className={[
              "btn btn-light",
              styles.btnJSONEditorModal
            ].join(" ")}
            onClick={this.clickCancel}
          >
            Cancel
          </a>

        </div>
      </div>
    );

  }

}

export default connect(mapStateToProps)(withRouter(JSONEditor));
