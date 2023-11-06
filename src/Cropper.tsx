import { Resizable } from "re-resizable";
import { useEffect, useState } from "react";

function Cropper(props: {
  videoSize: { w: number; h: number };
  viewPos: { x: number; y: number };
  setViewPos: (pos: { x: number; y: number }) => void;
  viewSize: { w: number; h: number };
  setViewSize: (size: { w: number; h: number }) => void;
}) {
  const { videoSize, viewSize } = props;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [maxPosition, setMaxPosition] = useState({ x: 1000, y: 1000 });

  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setMaxPosition({
      x: videoSize.w - 400,
      y: videoSize.h - 400,
    });
  }, [videoSize]);

  useEffect(() => {
    console.log("cropper load");
  });

  // Listen for window resize events and update video size
  // useEffect(() => {
  //   const updateVideoSize = () => {
  //     const video = videoRef.current;

  //     if (video) {
  //       const width = video.offsetWidth;
  //       const height = video.offsetHeight;

  //       setVideoSize({ w: width, h: height });
  //     }
  //   };
  //   window.addEventListener("resize", updateVideoSize);

  //   // Clean up the event listener when the component unmounts
  //   return () => {
  //     window.removeEventListener("resize", updateVideoSize);
  //   };
  // });

  const handleMouseDown = () => {
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) {
      const newX = Math.max(
        Math.min(position.x + e.movementX, maxPosition.x),
        0
      );
      const newY = Math.max(
        Math.min(position.y + e.movementY, maxPosition.y),
        0
      );
      const newPosition = {
        x: newX,
        y: newY,
      };
      setPosition(newPosition);
    }
  };

  return (
    <Resizable
      className="Cropper"
      style={{
        position: "absolute",
        width: viewSize.w,
        height: viewSize.h,
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      defaultSize={{
        width: 400,
        height: 400,
      }}
      enable={{
        left: true,
        right: true,
        bottom: true,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      ></div>
    </Resizable>
  );
}

export default Cropper;
