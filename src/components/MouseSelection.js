// @flow

import React, { Component } from "react";

import "../style/MouseSelection.css";

import type { T_LTWH } from "../types.js";

type Coords = {
  x: number,
  y: number
};

type State = {
  locked: boolean,
  start: ?Coords,
  end: ?Coords
};

type Props = {
  onSelection: (
    startTarget: HTMLElement,
    boundingRect: T_LTWH,
    resetSelection: () => void
  ) => void,
  onDragStart: () => void,
  onDragEnd: () => void,
  shouldStart: (event: MouseEvent) => boolean,
  onChange: (isVisible: boolean) => void
};

class MouseSelection extends Component<Props, State> {
  state: State = {
    locked: false,
    start: null,
    end: null
  };

  props: Props;

  root: ?HTMLElement;

  reset = () => {
    const { onDragEnd } = this.props;

    onDragEnd();
    this.setState({ start: null, end: null, locked: false });
  };

  getBoundingRect(start: Coords, end: Coords): T_LTWH {
    return {
      left: Math.min(end.x, start.x),
      top: Math.min(end.y, start.y),

      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y)
    };
  }

  componentDidUpdate() {
    const { onChange } = this.props;
    const { start, end } = this.state;

    const isVisible = Boolean(start && end);

    onChange(isVisible);
  }

  componentDidMount() {
    if (!this.root) {
      return;
    }

    const that = this;

    const { onSelection, onDragStart, onDragEnd, shouldStart } = this.props;

    const container = this.root.parentElement;

    if (!(container instanceof HTMLElement)) {
      return;
    }

    let containerBoundingRect = null;

    const containerCoords = (pageX: number, pageY: number) => {
      if (!containerBoundingRect) {
        containerBoundingRect = container.getBoundingClientRect();
      }

      return {
        x: pageX - containerBoundingRect.left + container.scrollLeft,
        y: pageY - containerBoundingRect.top + container.scrollTop
      };
    };

    container.addEventListener("mousemove", (event: MouseEvent) => {
      const { start, locked } = this.state;

      if (!start || locked) {
        return;
      }

      that.setState({
        ...this.state,
        end: containerCoords(event.pageX, event.pageY)
      });
    });

    container.addEventListener("mousedown", (event: MouseEvent) => {
      if (!shouldStart(event)) {
        this.reset();
        return;
      }

      const startTarget = event.target;

      if (!(startTarget instanceof HTMLElement)) {
        return;
      }

      onDragStart();

      this.setState({
        start: containerCoords(event.pageX, event.pageY),
        end: null,
        locked: false
      });

      const onMouseUp = (event: MouseEvent): void => {
        // emulate listen once
        event.currentTarget.removeEventListener("mouseup", onMouseUp);

        const { start } = this.state;

        if (!start) {
          return;
        }

        const end = containerCoords(event.pageX, event.pageY);

        const boundingRect = that.getBoundingRect(start, end);

        if (
          !(event.target instanceof HTMLElement) ||
          !container.contains(event.target) ||
          !that.shouldRender(boundingRect)
        ) {
          that.reset();
          return;
        }

        that.setState(
          {
            end,
            locked: true
          },
          () => {
            const { start, end } = that.state;

            if (!start || !end) {
              return;
            }

            if (event.target instanceof HTMLElement) {
              onSelection(startTarget, boundingRect, that.reset);

              onDragEnd();
            }
          }
        );
      };

      if (document.body) {
        document.body.addEventListener("mouseup", onMouseUp);
      }
    });
  }

  shouldRender(boundingRect: T_LTWH) {
    return boundingRect.width >= 1 && boundingRect.height >= 1;
  }

  render() {
    const { start, end } = this.state;

    return (
      <div
        className="MouseSelection-container"
        ref={node => (this.root = node)}
      >
        {start && end ? (
          <div
            className="MouseSelection"
            style={this.getBoundingRect(start, end)}
          />
        ) : null}
      </div>
    );
  }
}

export default MouseSelection;
