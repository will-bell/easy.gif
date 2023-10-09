import React, { useState, useRef, useEffect } from "react";
import videoSource from "./assets/happiness.mp4";

function Selector(props: {
  videoSource: string | null;
  setVideoSource: (url: string) => void;

  setPosCrop: (pos: { x: number; y: number }) => void;
  setSizeCrop: (size: { w: number; h: number }) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewPortRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);

  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 }); // Initialize video size to 0

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [maxPosition, setMaxPosition] = useState({ x: 0, y: 0 });

  const [scale, setScale] = useState(1); // Initialize scale factor to 1
  const [minScale, setMinScale] = useState(1);

  useEffect(() => {
    if (videoRef.current !== null) {
      console.log("videoRef is set!", videoRef.current);
      // Now TypeScript knows that videoRef.current is non-null
      videoRef.current.addEventListener("loadedmetadata", () => {
        const { videoWidth, videoHeight } =
          videoRef.current as HTMLVideoElement;

        console.log(videoWidth, videoHeight)

        setVideoSize({ w: videoWidth, h: videoHeight });

        const defaultScale = Math.max(400 / videoWidth, 400 / videoHeight);
        setMinScale(defaultScale);
        setScale(defaultScale);

        setMaxPosition({
          x: -videoWidth * defaultScale + 400,
          y: -videoHeight * defaultScale + 400,
        });

        const defaultPosition = {
          x: (-videoWidth * defaultScale + 400) / 2,
          y: (-videoHeight * defaultScale + 400) / 2,
        }

        setPosition(defaultPosition);

        props.setPosCrop({
          x: Math.abs(defaultPosition.x) / defaultScale,
          y: Math.abs(defaultPosition.y) / defaultScale,
        });
        props.setSizeCrop({
          w: 400 / defaultScale,
          h: 400 / defaultScale,
        })
      });
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      console.log("got new file", event.target.files[0])
      const file = event.target.files[0];
      if (file) {
        const objectURL = URL.createObjectURL(file);
        props.setVideoSource(objectURL);

        // Also update the Video ref
        if (videoRef.current !== null) {
          videoRef.current.src = objectURL;
        }
      }
    }
  };

  const handleMouseDown = () => {
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (dragging) {
      const newPosition = {
        x: Math.max(Math.min(position.x + e.movementX, 0), maxPosition.x),
        y: Math.max(Math.min(position.y + e.movementY, 0), maxPosition.y)
      }
      setPosition(newPosition);

      props.setPosCrop({
        x: Math.abs(newPosition.x) / scale,
        y: Math.abs(newPosition.y) / scale,
      });
      props.setSizeCrop({
        w: 400 / scale,
        h: 400 / scale,
      })
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLVideoElement>) => {
    const viewPortRect = viewPortRef.current?.getBoundingClientRect();
    if (!viewPortRect) {
      return;
    }

    let scaleFactor = 1;
    if (e.deltaY < 0) {
      // Zoom in
      if (scale < 10) {
        scaleFactor = 1.05;
      }
    } else {
      // Zoom out
      if (scale > minScale) {
        scaleFactor = 1 / 1.05;
      }
    }
    // Still need to apply limits
    const newScale = Math.min(Math.max(scale * scaleFactor, minScale), 10);

    // Need to calculate this to account for drift when we hit the limits
    const correctScaleFactor = newScale / scale;

    const newMaxX = -videoSize.w * newScale + 400;
    const newMaxY = -videoSize.h * newScale + 400;

    // Zoom in and out centered on the mouse position
    const mouseX = e.clientX - viewPortRect.left;
    const mouseY = e.clientY - viewPortRect.top;

    const newX = mouseX + correctScaleFactor * (position.x - mouseX);
    const newY = mouseY + correctScaleFactor * (position.y - mouseY);
    const newPosition = {
      x: Math.max(Math.min(newX, 0), newMaxX),
      y: Math.max(Math.min(newY, 0), newMaxY)
    }

    // Nico was here <3
    setScale(newScale);
    setPosition(newPosition);
    setMaxPosition({ x: newMaxX, y: newMaxY });

    props.setPosCrop({
      x: Math.abs(newPosition.x) / newScale,
      y: Math.abs(newPosition.y) / newScale
    })
    props.setSizeCrop({
      w: 400 / newScale,
      h: 400 / newScale
    })
  };

  return (
    <div className="Selector">
      <div
        ref={viewPortRef}
        style={{
          overflow: "hidden",
          position: "relative",
          width: "400px",
          height: "400px",
        }}
      >
        <video
          ref={videoRef}
          src={videoSource}
          controls={false}
          style={{
            position: "relative",
            left: `${position.x}px`,
            top: `${position.y}px`,
            // TODO zoom in on the cursor position, not the top-left of the video
            transform: `scale(${scale})`, // Apply the scale
            transformOrigin: "0 0", // Transform from the top left
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button onClick={() => videoRef.current?.play()}>Play</button>
        <button onClick={() => videoRef.current?.pause()}>Pause</button>
      </div>
      <input
        type="file"
        accept="video/mp4"
        onChange={handleFileChange}
        className="hidden-file-input"
        id="fileInput"
      ></input>
      <label htmlFor="fileInput" className="button-facade">
        Upload File
      </label>
    </div>
  );
}

export default Selector;
