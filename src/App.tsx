import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

function FilePicker(props: { setVideoSource: (url: string) => void }) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      if (file) {
        const objectURL = URL.createObjectURL(file);
        props.setVideoSource(objectURL);
      }
    }
  };

  return <input type="file" accept="video/mp4" onChange={handleFileChange} />;
}

function Converter(props: {
  videoSource: string | null;
  setGifSource: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    // TODO: make this the multithreaded version
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/esm";
    const ffmpeg = ffmpegRef.current;

    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    setLoaded(true);
  };

  const convert = async () => {
    const ffmpeg = ffmpegRef.current;
    if (props.videoSource) {
      console.log("videoSource", props.videoSource);
      await ffmpeg.writeFile("input.mp4", await fetchFile(props.videoSource));

      // Convert the video to a Gif with 10fps framerate
      ffmpeg.on("progress", ({ progress }) => {
        console.log("progress", progress);
      });
      await ffmpeg.exec(["-i", "input.mp4", "-r", "10", "output.gif"]);

      const outputGifData = await ffmpeg.readFile("output.gif");
      const data = new Uint8Array(outputGifData as ArrayBuffer);

      props.setGifSource(
        URL.createObjectURL(new Blob([data], { type: "image/gif" }))
      );
    }
  };

  return loaded ? (
    <button onClick={convert}>Transcode mp4 to gif</button>
  ) : (
    <button onClick={load}>Load ffmpeg-core</button>
  );
}

function GifPreview(props: { gifSource: string | null }) {
  console.log("gifSource=", props.gifSource);
  return (
    <img
      src={props.gifSource || ""}
      style={{ width: "400px", height: "400px" }}
    />
  );
}

function App() {
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [gifSource, setGifSource] = useState<string | null>(null);
  return (
    <>
      <h1>FFmpeg Wasm Demo</h1>
      <FilePicker setVideoSource={setVideoSource} />
      <video
        ref={(ref) => {
          if (ref) {
            ref.src = videoSource || "";
          }
        }}
        controls
        style={{ width: "400px" }}
      />
      <Converter videoSource={videoSource} setGifSource={setGifSource} />
      <GifPreview gifSource={gifSource} />
    </>
  );
}

export default App;
