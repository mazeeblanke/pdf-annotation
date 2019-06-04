// @flow

/* eslint-disable */

import React, { Component } from "react";
import { withFirebase } from './Firebase';
import { Button } from 'semantic-ui-react'

import URLSearchParams from "url-search-params";
// let alphanumeric = require('alphanumeric-id');
import alphanumeric from 'alphanumeric-id'
import axios from 'axios'
// import AWS from 'aws-sdk';
// import { Auth } from 'aws-amplify';
// import pdf2base64 from 'pdf-to-base64';
// import Amplify, { Analytics, Storage, API } from 'aws-amplify';

import { AuthUserContext } from './Session';

import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight,
  Popup,
  AreaHighlight
} from ".";

import testHighlights from "./test-highlights";

import Spinner from "./Spinner";
import Sidebar from "./Sidebar";
import Display from './Display';

import type { T_Highlight, T_NewHighlight } from "../src/types";

import "../style/App.css";
import SignOut from "./SignOut";

type T_ManuscriptHighlight = T_Highlight;

type Props = {};

type State = {
  highlights: Array<T_ManuscriptHighlight>
};

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () => location.hash.slice("#highlight-".length);

const resetHash = () => {
  location.hash = "";
};



const HighlightPopup = ({ comment }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

// const DEFAULT_URL = "https://arxiv.org/pdf/1708.08021.pdf";

const searchParams = new URLSearchParams(location.search);
let url;
// const url = searchParams.get("url") || DEFAULT_URL;

const base64ToUint8Array = (base64) => {
  var raw = atob(base64);
  var uint8Array = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) {
    uint8Array[i] = raw.charCodeAt(i);
  }
  return uint8Array;
}

const getPdfBlob = (base64String) => {
  return base64ToUint8Array(base64String)
}

class App extends Component<Props, State> {
  state = {
    highlights: [],
    url: null,
    availableDocuments: {},
    availableDocumentsIds: [],
    loading: false,
    limit: 5,
    activeDocId: null,
  };

  state: State;

  resetHighlights = () => {
    this.setState({
      highlights: []
    });
  };

  scrollViewerTo = (highlight: any) => { };

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentDidMount() {
    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );
    this.onListenForDocuments();
    this.props.firebase.auth.onAuthStateChanged(function(user) {
      if (user) {
      } else {
        // No user is signed in.
        location.href = '/signin'
      }
    });

  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find(highlight => highlight.id === id);
  }

  addHighlight(highlight: T_NewHighlight) {
    const { highlights } = this.state;

    console.log("Saving highlight", highlight);
    const annotationId = getNextId()
    let payload = {
      content: JSON.stringify(highlight),
      annotationId,
      documentId: this.state.activeDocId,
      userId: this.getUsername(),
      version: 0,
      deleted: false

    }

    this.props.firebase.annotation(annotationId).set(payload)

    this.setState({
      highlights: [ {...payload, ...highlight }, ...highlights]
    });
  }

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    this.setState({
      highlights: this.state.highlights.map(h => {
        return h.id === highlightId
          ? {
            ...h,
            position: { ...h.position, ...position },
            content: { ...h.content, ...content }
          }
          : h;
      })
    });
  }

  getUsername () {
    // console.log(this.props.authUser.email);
    return this.props.authUser.email
  }

  handleChange = (e) => {
    let selectedFile = e.target.files;
    let refId = alphanumeric(32);
    if (selectedFile.length > 0) {
      var fileToLoad = selectedFile[0];
      var fileReader = new FileReader();

      var base64;
      fileReader.onload = async (fileLoadedEvent) => {

        var binaryString = fileLoadedEvent.target.result;
        let base64 = btoa(binaryString);

        let userId = await this.getUsername();

        const payload = {
          base64,
          refId,
          timeAdded: Date.now(),
          userId
        };


        this.props.firebase.document(refId).set(payload).then(() => {
          this.setState({
            availableDocuments: { ...this.state.availableDocuments, [refId]: payload },
            // availableDocumentsIds: [...this.state.availableDocumentsIds, refId]
          })
          this.renderDoc(refId)
        })
      };
      // Convert data to base64
      fileReader.readAsBinaryString(fileToLoad);
    }
  }

  componentWillUnmount() {
    this.props.firebase.documents().off();
  }

  onListenForDocuments = () => {
    this.setState({ loading: true });

    this.props.firebase
      .documents()
      .orderByChild('timeAdded')
      .limitToLast(this.state.limit)
      .on('value', snapshot => {
        const documentObject = snapshot.val();

        if (documentObject) {
          const availableDocumentsIds = Object.keys(documentObject).map(key => key);
          this.setState({
            loading: false,
            availableDocumentsIds: availableDocumentsIds,
            availableDocuments: documentObject,
          });
        } else {
          this.setState({ availableDocumentsIds: [], availableDocuments: {}, loading: false });
        }
      });
  }

  renderPdf() {
    return (
      <PdfLoader url={this.state.url} beforeLoad={<Spinner />}>
        {pdfDocument => (
          <PdfHighlighter
            pdfDocument={pdfDocument}
            enableAreaSelection={event => event.altKey}
            onScrollChange={resetHash}
            scrollRef={scrollTo => {
              this.scrollViewerTo = scrollTo;

              this.scrollToHighlightFromHash();
            }}
            onSelectionFinished={(
              position,
              content,
              hideTipAndSelection,
              transformSelection
            ) => (
                <Tip
                  onOpen={transformSelection}
                  onConfirm={comment => {
                    this.addHighlight({ content, position, comment });

                    hideTipAndSelection();
                  }}
                />
              )}
            highlightTransform={(
              highlight,
              index,
              setTip,
              hideTip,
              viewportToScaled,
              screenshot,
              isScrolledTo
            ) => {
              const isTextHighlight = !Boolean(
                highlight.content && highlight.content.image
              );

              const component = isTextHighlight ? (
                <Highlight
                  isScrolledTo={isScrolledTo}
                  position={highlight.position}
                  comment={highlight.comment}
                />
              ) : (
                  <AreaHighlight
                    highlight={highlight}
                    onChange={boundingRect => {
                      this.updateHighlight(
                        highlight.id,
                        { boundingRect: viewportToScaled(boundingRect) },
                        { image: screenshot(boundingRect) }
                      );
                    }}
                  />
                );

              return (
                <Popup
                  popupContent={<HighlightPopup {...highlight} />}
                  onMouseOver={popupContent =>
                    setTip(highlight, highlight => popupContent)
                  }
                  onMouseOut={hideTip}
                  key={index}
                  children={component}
                />
              );
            }}
            highlights={this.state.highlights}
          />
        )}
      </PdfLoader>
    )
  }

  renderDoc = (docId) => {

    const doc = this.state.availableDocuments[docId];
    const url = getPdfBlob(doc.base64);

    this.props.firebase
      .annotations()
      .orderByKey()
      .once("value")
      .then((snapshot) => {

        let highlights = Object.values(snapshot.val()).filter(a => a.documentId == docId).map(a => ({
          ...a,
          ...JSON.parse(a.content)
        }))
          this.setState({
            highlights,
          })
      })


    this.setState({
      url,
      activeDocId: docId,
    })
  }

  removeRenderedDoc = () => {
    this.setState({
      highlights: [],
      url: null,
      activeDocId: null
    })
  }

  render() {
    const { highlights } = this.state;

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        <Display if={this.state.url}>
          <div
            onClick={this.removeRenderedDoc}
            className="closedoc"
          >
            <img src="https://img.icons8.com/ios/50/000000/delete-sign.png" />

          </div>
        </Display>
        <div className="authbar">
          <img className="avatar" src="/img/avatar.jpg" ></img>
          <SignOut></SignOut>
        </div>
        <Sidebar
          highlights={highlights}
          resetHighlights={this.resetHighlights}
          availableDocumentsIds={this.state.availableDocumentsIds}
          availableDocuments={this.state.availableDocuments}
          renderDoc={this.renderDoc}
          loading={this.state.loading}
          userId={this.props.authUser && this.props.authUser.email}
        />
        <div
          style={{
            height: "100vh",
            width: "75vw",
            overflowY: "scroll",
            position: "relative"
          }}
        >
          <Display if={this.state.url}>
            {
              this.renderPdf()
            }
          </Display>
          <Display if={!this.state.url}>
            <div className="mid" style={{
              height: "100vh",

            }}>
              <input onChange={this.handleChange} ref={(node) => this.fileRef = node} type="file" hidden></input>
              <Button onClick={() => console.log(this.fileRef.click())} secondary>Upload Pdf</Button>
            </div>

          </Display>
        </div>
      </div>
    );
  }
}

const WrapApp = (props) => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <App {...props} authUser={authUser} />
      ) : (
        <App  {...props}/>
      )
    }
  </AuthUserContext.Consumer>
);

export default withFirebase(WrapApp);
