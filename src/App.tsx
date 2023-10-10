import { useState } from "react";
import happinessSource from "./assets/happiness.mp4";
import Selector from "./Selector";
import Converter from "./Converter";

function App() {
  const [videoSource, setVideoSource] = useState<string>(happinessSource);
  const [posCrop, setPosCrop] = useState({ x: 0, y: 0 });
  const [sizeCrop, setSizeCrop] = useState({ w: 0, h: 0 });
  const [videoTrim, setVideoTrim] = useState({ start: 0, end: 100 });
  return (
    <>
      <h1>easy.gif</h1>
      <div className="App">
        <Selector
          videoSource={videoSource}
          setVideoSource={setVideoSource}

          setPosCrop={setPosCrop}
          setSizeCrop={setSizeCrop}

          videoTrim={videoTrim}
          setVideoTrim={setVideoTrim} />
        <Converter videoSource={videoSource} posCrop={posCrop} sizeCrop={sizeCrop} />
      </div>
    </>
  );
}

export default App;
