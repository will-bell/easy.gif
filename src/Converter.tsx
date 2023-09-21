import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import waitingSource from "./assets/waiting.gif";

function Converter(props: { videoSource: string | null }) {
  const [loaded, setLoaded] = useState(false);
  const [gifSource, setGifSource] = useState<string | null>(null);

  const ffmpegRef = useRef(new FFmpeg());

  const load = async (ffmpeg: FFmpeg) => {
    // TODO: make this the multithreaded version
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/esm";

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

    // Load ffmpeg-core.js and ffmpeg-core.wasm
    if (!loaded) await load(ffmpeg);

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

      setGifSource(
        URL.createObjectURL(new Blob([data], { type: "image/gif" }))
      );
    }
  };

  return (
    <div className="Converter">
      <img
        src={gifSource || waitingSource}
        // Prevent the image from being squished
        style={{
          width: "400px",
          height: "400px",
          overflow: "hidden",
          objectFit: "cover",
        }}
      />
      <button onClick={convert}>Convert</button>
    </div>
  );
}

export default Converter;
