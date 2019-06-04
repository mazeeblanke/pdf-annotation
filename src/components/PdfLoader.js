

import React, { Component } from "react";

import pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc =`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

class PdfLoader extends Component {
  state = {
    pdfDocument: null
  };

  shouldComponentUpdate(nextProps) {
    const { url } = nextProps;

    // for simplicity i am assuming that the length denotes unique pdfs
    if (url.length !== this.props.url.length) {
      pdfjs.getDocument(url).then(pdfDocument => {
        this.setState({ pdfDocument: null });
        setTimeout(() => {
          this.setState({
            pdfDocument: pdfDocument
          });
        }, 0)
      });
    }
    return true
  }

  componentDidMount() {
    const { url } = this.props;

    pdfjs.getDocument(url).promise.then(pdfDocument => {
      this.setState({
        pdfDocument: pdfDocument
      });
    });
  }

  render() {
    const { children, beforeLoad } = this.props;
    const { pdfDocument } = this.state;

    if (pdfDocument) {
      return children(pdfDocument);
    }

    return beforeLoad;
  }
}

export default PdfLoader;
