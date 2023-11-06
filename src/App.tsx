import { useRef, useState } from "react";
import happinessSource from "./assets/happiness.mp4";
import { Paper } from "@mui/material";
import VideoPreview from "./VideoPreview";
import Cropper from "./Cropper";
import EditorControls from "./EditorControls";
import { useEffect } from "react";

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Need to understand how I can get updated sizes for everything when the window size changes
    if (appRef.current) {
      console.log("app width", appRef.current.offsetWidth);
    }
  }, []); // Empty dependency array means this useEffect runs once after mount

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSource, setVideoSource] = useState<string>(happinessSource);
  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 }); // Initialize video size to 0

  const [viewPos, setViewPos] = useState({ x: 0, y: 0 });
  const [viewSize, setViewSize] = useState({ w: 400, h: 400 });

  const [posCrop, setPosCrop] = useState({ x: 0, y: 0 });
  const [sizeCrop, setSizeCrop] = useState({ w: 0, h: 0 });

  const [videoTrim, setVideoTrim] = useState({ start: 0, end: 100 });

  useEffect(() => {
    // I think the components are loading in the wrong order to cause the weird uneven alpha-ing bug when switching tabs/resizing the window.
    console.log("app load");
  });

  return (
    <>
      <h1>easy.gif</h1>
      <div className="App" ref={appRef}>
        <div className="VideoContainer">
          <VideoPreview
            videoRef={videoRef}
            videoSource={videoSource}
            setVideoSize={setVideoSize}
          />
          <Cropper
            videoSize={videoSize}
            viewPos={viewPos}
            setViewPos={setViewPos}
            viewSize={viewSize}
            setViewSize={setViewSize}
          />
        </div>
        {/* <Paper>
          <SelectorControls
            videoRef={videoRef}
            setVideoSource={setVideoSource}
          />
          <EditorControls
            videoRef={videoRef}
            videoTrim={videoTrim}
            setVideoTrim={setVideoTrim}
          />
          <ConverterControls
            videoSource={videoSource}
            videoTrim={videoTrim}
            viewPos={viewPos}
            viewSize={viewSize}
          />
        </Paper> */}
      </div>
    </>
  );
}

export default App;
