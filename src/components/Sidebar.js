// @flow
/* eslint-disable */

import React from "react";
import Spinner from "./Spinner";

import Display from "./Display";
// import { T_Highlight } from "../../src/types";
// type T_ManuscriptHighlight = T_Highlight;

// type Props = {
//   highlights: Array<T_ManuscriptHighlight>,
//   resetHighlights: () => void
// };

const updateHash = highlight => {
  location.hash = `highlight-${highlight.id}`;
};

function Sidebar({ highlights, resetHighlights, availableDocumentsIds, availableDocuments, userId,  renderDoc, loading }: Props) {

  let handleEdit = (e) => {
    e.stopPropagation()
    console.log('skjdks');
  }

  let handleDelete = (e) => {
    e.stopPropagation()
    console.log('skjdks');
  }

  return (
    <div className="sidebar" style={{ width: "22vw" }}>
      <div className="description" style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>PDF Highlighter</h2>

        <p>
          <small>
            To create area highlight hold ⌥ Option key (Alt), then click and
            drag.
          </small>
        </p>
      </div>
      <h5 className="ml-20">Availiable Documents</h5>
      <Display if={availableDocumentsIds.length && !loading}>
        <ul className="availableDocsId">
          {
            availableDocumentsIds.map(refId => (
              <li key={refId} onClick={() => renderDoc(refId)}>
                {refId}



              </li>
            ))
          }
        </ul>
      </Display>
      <Display if={loading}>
        <Spinner height="20vh" />
      </Display>


      <br />
      <br />
      { !!highlights.length && <h5 className="ml-20">Anotations</h5> }
      <ul className="sidebar__highlights">
        {highlights.map((highlight, index) => (
          <li
            key={index}
            className="sidebar__highlight"
            onClick={() => {
              updateHash(highlight);
            }}
          >
            <div>
              <strong>{highlight.comment.text}</strong>
              {
                highlight.userId === userId && (
                <span className="action">
                  <i onClick={(e) => handleEdit(e)} className="fas fa-pen"></i>
                  <i onClick={(e) => handleDelete(e)} style={{ padding: '0px 10px'}} className="far fa-trash-alt"></i>
                </span>
                )
              }
              {highlight.content.text ? (
                <blockquote style={{ marginTop: "0.5rem" }}>
                  {`${highlight.content.text.slice(0, 90).trim()}…`}
                </blockquote>
              ) : null}
              {
                highlight.userId && <p style={{ fontSize: '10px', marginTop: '20px'}}>{'Added by ' + highlight.userId}</p>
              }
              {highlight.content.image ? (
                <div
                  className="highlight__image"
                  style={{ marginTop: "0.5rem" }}
                >
                  <img src={highlight.content.image} alt={"Screenshot"} />
                </div>
              ) : null}
            </div>
            <div className="highlight__location">
              Page {highlight.position.pageNumber}
            </div>
          </li>
        ))}
      </ul>
      {highlights.length > 0 ? (
        <div style={{ padding: "1rem" }}>
          <a href="#" onClick={resetHighlights}>
            Reset highlights
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default Sidebar;
