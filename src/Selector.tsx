import React, { useState, useRef, useEffect } from "react";
import videoSource from "./assets/happiness.mp4";

function Selector(props: {
  videoSource: string | null;
  setVideoSource: (url: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [dragging, setDragging] = useState(false);

  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 }); // Initialize video size to 0

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [maxPosition, setMaxPosition] = useState({ x: 0, y: -10 });

  const [scale, setScale] = useState(1); // Initialize scale factor to 1
  const [minScale, setMinScale] = useState(1);

  const [posCrop, setPosCrop] = useState({ x: 0, y: 0 });
  const [sizeCrop, setSizeCrop] = useState({ w: 400, h: 400 });

  useEffect(() => {
    if (videoRef.current !== null) {
      console.log("videoRef is set!", videoRef.current);
      // Now TypeScript knows that videoRef.current is non-null
      videoRef.current.addEventListener("loadedmetadata", () => {
        const { videoWidth, videoHeight } =
          videoRef.current as HTMLVideoElement;

        setVideoSize({ w: videoWidth, h: videoHeight });
        console.log("videoWidth, videoHeight", videoWidth, videoHeight);

        const defaultScale = Math.max(400 / videoWidth, 400 / videoHeight);
        setMinScale(defaultScale);
        setScale(defaultScale);

        setMaxPosition({
          x: -videoWidth * defaultScale + 400,
          y: -videoHeight * defaultScale + 400,
        });
      });
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      if (file) {
        const objectURL = URL.createObjectURL(file);
        props.setVideoSource(objectURL);
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
      setPosition({
        x: Math.max(Math.min(position.x + e.movementX, 0), maxPosition.x),
        y: Math.max(Math.min(position.y + e.movementY, 0), maxPosition.y),
      });
      setPosCrop({
        x: Math.abs(position.x) / scale,
        y: Math.abs(position.y) / scale,
      });
      console.log("position, maxPosition", position, maxPosition);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLVideoElement>) => {
    if (e.deltaY < 0) {
      // Zoom in
      setScale((prevScale) => prevScale * 1.01);
      setMaxPosition({
        x: -videoSize.w * scale + 400,
        y: -videoSize.h * scale + 400,
      });
    } else {
      // Zoom out
      setScale((prevScale) => Math.max(prevScale / 1.01, minScale));
      setMaxPosition({
        x: -videoSize.w * scale + 400,
        y: -videoSize.h * scale + 400,
      });
    }
    // Nico was here <3
    setSizeCrop({ w: 400 / scale, h: 400 / scale });
  };

  return (
    <div className="Selector">
      <div
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
