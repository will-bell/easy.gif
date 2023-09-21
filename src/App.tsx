import { useState } from "react";
import Selector from "./Selector";
import Converter from "./Converter";

function App() {
  const [videoSource, setVideoSource] = useState<string | null>(null);
  return (
    <>
      <h1>easy.gif</h1>
      <div className="App">
        <Selector videoSource={videoSource} setVideoSource={setVideoSource} />
        <Converter videoSource={videoSource} />
      </div>
    </>
  );
}

export default App;
