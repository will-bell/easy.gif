import React, { useState, useRef, useEffect } from "react";
import videoSource from "./assets/happiness.mp4";

function Selector(props: {
  videoSource: string | null;
  setVideoSource: (url: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current !== null) {
      console.log("videoRef is set!", videoRef.current);
      // Now TypeScript knows that videoRef.current is non-null
    }
  }, []);

  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1); // Initialize scale factor to 1

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
      const x = position.x + e.movementX;
      const y = position.y + e.movementY;
      setPosition({ x, y });
    }
  };

  // const handleZoomIn = () => {
  //   setScale((prevScale) => prevScale * 1.1); // Increase scale by 10%
  // };

  // const handleZoomOut = () => {
  //   setScale((prevScale) => prevScale / 1.1); // Decrease scale by 10%
  // };

  const handleWheel = (e: React.WheelEvent<HTMLVideoElement>) => {
    if (e.deltaY < 0) {
      setScale((prevScale) => prevScale * 1.01); // Zoom in
    } else {
      setScale((prevScale) => prevScale / 1.01); // Zoom out
    }
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
          // ref={(ref) => {
          //   if (ref) {
          //     // default to the video in the assets directory
          //     // ref.src = props.videoSource || "assets/video.mp4";
          //     ref.src = "assets/video.mp4";
          //   }
          // }}
          ref={videoRef}
          src={videoSource}
          controls={false}
          style={{
            position: "absolute",
            cursor: dragging ? "grabbing" : "grab",
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: `scale(${scale})`, // Apply the scale
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Custom video controls here */}
          {/* <button onClick={handleZoomIn}>Zoom In</button>
          <button onClick={handleZoomOut}>Zoom Out</button> */}
          <button onClick={() => videoRef.current?.play()}>Play</button>
          <button onClick={() => videoRef.current?.pause()}>Pause</button>
        </div>
      </div>

      <>
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
      </>
    </div>
  );
}

export default Selector;
