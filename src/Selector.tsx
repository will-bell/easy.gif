import React, { useState, useRef, useEffect } from "react";
import { Slider } from "@mui/material";
import { Resizable, ResizeCallback } from "re-resizable";
import "./selector.css";

function Selector(props: {
  videoSource: string;
  setVideoSource: (url: string) => void;

  viewPortSize: { w: number; h: number };
  setViewPortSize: (size: { w: number; h: number }) => void;

  setPosCrop: (pos: { x: number; y: number }) => void;
  setSizeCrop: (size: { w: number; h: number }) => void;

  videoTrim: { start: number; end: number };
  setVideoTrim: (trim: { start: number; end: number }) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewPortRef = useRef<HTMLDivElement>(null);

  const { videoSource, setVideoSource, viewPortSize, setViewPortSize, setPosCrop, setSizeCrop, videoTrim, setVideoTrim } = props;

  const [dragging, setDragging] = useState(false);

  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 }); // Initialize video size to 0

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [maxPosition, setMaxPosition] = useState({ x: 0, y: 0 });

  const [scale, setScale] = useState(1); // Initialize scale factor to 1
  const [minScale, setMinScale] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleVideoLoad = () => {
      const { videoWidth, videoHeight, duration } =
        video as HTMLVideoElement;

      setVideoSize({ w: videoWidth, h: videoHeight });
      setVideoTrim({ start: 0, end: duration });

      const defaultScale = Math.max(viewPortSize.w / videoWidth, viewPortSize.h / videoHeight);
      setMinScale(defaultScale);
      setScale(defaultScale);

      setMaxPosition({
        x: -videoWidth * defaultScale + viewPortSize.w,
        y: -videoHeight * defaultScale + viewPortSize.h,
      });

      const defaultPosition = {
        x: (-videoWidth * defaultScale + viewPortSize.w) / 2,
        y: (-videoHeight * defaultScale + viewPortSize.h) / 2,
      }

      // setPosition(defaultPosition);
      setPosition({ x: 0, y: 0 })

      setPosCrop({
        x: Math.abs(defaultPosition.x) / defaultScale,
        y: Math.abs(defaultPosition.y) / defaultScale,
      });
      setSizeCrop({
        w: viewPortSize.w / defaultScale,
        h: viewPortSize.h / defaultScale,
      })
    }
    video.addEventListener("loadedmetadata", handleVideoLoad);

    // Cleanup: remove event listeners and any other necessary cleanup.
    return () => {
      video.removeEventListener("loadedmetadata", handleVideoLoad);

    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSource]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleTimeUpdate = () => {
      if (video.currentTime >= videoTrim.end) {
        video.currentTime = videoTrim.start;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    video.currentTime = videoTrim.start;

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, [videoTrim, videoRef]);

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

      setPosCrop({
        x: Math.abs(newPosition.x) / scale,
        y: Math.abs(newPosition.y) / scale,
      });
      setSizeCrop({
        w: viewPortSize.w / scale,
        h: viewPortSize.h / scale,
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

    const newMaxX = -videoSize.w * newScale + viewPortSize.w;
    const newMaxY = -videoSize.h * newScale + viewPortSize.h;

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

    setPosCrop({
      x: Math.abs(newPosition.x) / newScale,
      y: Math.abs(newPosition.y) / newScale
    })
    setSizeCrop({
      w: viewPortSize.w / newScale,
      h: viewPortSize.h / newScale
    })
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      console.log("got new file", event.target.files[0])
      const file = event.target.files[0];
      if (file) {
        const objectURL = URL.createObjectURL(file);
        setVideoSource(objectURL);

        if (videoRef.current !== null) {
          videoRef.current.src = objectURL;
        }
      }
    }
  };

  const handleResize: ResizeCallback = (_e, _direction, _ref, d) => {
    // setViewPortSize({ w: viewPortSize.w + d.width, h: viewPortSize.h + d.height });
  }

  return (
    <div className="Selector">
      <div className="Preview" style={{
        overflow: "hidden",
      }}>
        <Resizable
          className="viewport"
          defaultSize={{
            width: 400,
            height: 400,
          }}
          enable={{
            left: true,
            right: true,
            bottom: true,
          }}
          onResize={handleResize}
        />
        <video
          className="video"
          ref={videoRef}
          src={videoSource}
          controls={false}
          autoPlay={true}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
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
      <Slider
        // TODO add accessiblity labels
        min={0}
        max={videoRef.current?.duration || 60}
        value={[videoTrim.start, videoTrim.end]}
        onChange={(_, newVideoTrim: number | number[]) => {
          if (newVideoTrim instanceof Array && newVideoTrim.length === 2) {
            setVideoTrim({ start: newVideoTrim[0], end: newVideoTrim[1] })
          }
        }}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => {
          const minutes = Math.floor(value / 60);
          const seconds = Math.floor(value % 60);
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }}
      />
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

    </div >
  );
}

export default Selector;
