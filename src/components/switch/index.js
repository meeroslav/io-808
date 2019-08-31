import React from "react";
import { useHover } from "react-events/hover";
import { usePress } from "react-events/press";

const VERTICAL = "vertical";
const HORIZONTAL = "horizontal";

const styles = {
  outer: {
    position: "relative",
    cursor: "pointer"
  },
  inner: {
    position: "absolute"
  },
  innerHover: {
    position: "absolute",
    opacity: 0.5
  }
};

const SoundSwitch = props => {
  const {
    position,
    thickness,
    length,
    direction,
    numPositions,
    innerThickness,
    onChange,
    padding = 0,
    innerStyle = {},
    outerStyle = {}
  } = props;

  const [state, setState] = React.useState(() => ({
    hover: false,
    hoverPosition: position,
    xPosition: null,
    yPosition: null
  }));

  const handleHoverStart = React.useCallback(evt => {
    const {
      left: xPosition,
      top: yPosition
    } = evt.target.getBoundingClientRect();
    setState(prev => ({ ...prev, hover: true, xPosition, yPosition }));
  }, []);

  const handleHoverMove = React.useCallback(
    ({ clientX, clientY }) => {
      setState(prevState => {
        const { xPosition, yPosition } = prevState;
        const totalLength = length - padding * 2;

        let currentRelativeCoord = null;
        switch (direction) {
          case HORIZONTAL:
            currentRelativeCoord = clientX - (xPosition + padding);
            break;
          case VERTICAL:
            currentRelativeCoord = clientY - (yPosition + padding);
            break;
        }

        if (currentRelativeCoord < 0) currentRelativeCoord = 0;
        if (currentRelativeCoord > totalLength - padding)
          currentRelativeCoord = totalLength - padding;

        const hoverPosition = ~~(
          (currentRelativeCoord / totalLength) *
          numPositions
        );

        return { ...prevState, hoverPosition };
      });
    },
    [direction, length, numPositions, padding]
  );

  const handleHoverEnd = React.useCallback(() => {
    setState(() => ({
      hover: false,
      xPosition: null,
      yPosition: null,
      hoverPosition: position
    }));
  }, [position]);

  const handlePress = React.useCallback(() => {
    onChange(state.hoverPosition);
  }, [onChange, state.hoverPosition]);

  const positionIncrement =
    (length - padding * 2 - innerThickness) / (numPositions - 1);
  const positionChange = positionIncrement * position;
  const hoverPositionChange = positionIncrement * state.hoverPosition;

  let width,
    height,
    innerWidth,
    innerHeight,
    transform,
    hoverTransform = null;
  switch (direction) {
    case VERTICAL:
      width = thickness;
      height = length;

      innerWidth = width - padding * 2;
      innerHeight = innerThickness;

      transform = `translateY(${positionChange}px)`;
      hoverTransform = `translateY(${hoverPositionChange}px)`;
      break;
    case HORIZONTAL:
      width = length;
      height = thickness;

      innerWidth = innerThickness;
      innerHeight = height - padding * 2;

      transform = `translateX(${positionChange}px)`;
      hoverTransform = `translateX(${hoverPositionChange}px)`;
      break;
    default:
      throw new Error(`Invalid Direction: ${direction}`);
  }

  const hoverListener = useHover({
    onHoverStart: handleHoverStart,
    onHoverEnd: handleHoverEnd,
    onHoverMove: handleHoverMove
  });

  const pressListener = usePress({
    onPress: handlePress
  });

  return (
    <div
      listeners={[hoverListener, pressListener]}
      style={{ ...styles.outer, ...outerStyle, width, height, padding }}
    >
      <div
        style={{
          ...styles.inner,
          ...innerStyle,
          width: innerWidth,
          height: innerHeight,
          transform,
          transition: "transform cubic-bezier(0.4, 0.0, 0.2, 1) .1s"
        }}
      />
      <div
        style={{
          ...styles.innerHover,
          ...innerStyle,
          width: innerWidth,
          height: innerHeight,
          transform: hoverTransform
        }}
      />
    </div>
  );
};

export default SoundSwitch;
