import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import waitingSource from "./assets/waiting.gif";

function Converter(props: {
  videoSource: string | null;
  viewPortSize: { w: number; h: number };
  posCrop: { x: number; y: number };
  sizeCrop: { w: number; h: number };
}) {
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
      await ffmpeg.writeFile("input", await fetchFile(props.videoSource));

      ffmpeg.on("progress", ({ progress }) => {
        console.log("progress", progress);
      });
      ffmpeg.on("log", ({ message }) => {
        console.log("log", message);
      });
      // Convert the video to a Gif with 10fps framerate
      // TODO: add palettegen and paletteuse filters to reduce file size and improve quality
      await ffmpeg.exec([
        "-i",
        "input",
        "-r",
        "10", // 10fps
        "-t",
        "10", // Cap it at 10 seconds for now
        // Crop the video based on the position and size of the crop box
        "-filter:v",
        `crop=${props.sizeCrop.w}:${props.sizeCrop.h}:${props.posCrop.x}:${props.posCrop.y}`,
        "output.gif",
      ]);

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
          width: `${props.viewPortSize.w}px`,
          height: `${props.viewPortSize.h}px`,
          overflow: "hidden",
          objectFit: "cover",
        }}
      />
      <button onClick={convert}>Convert</button>
    </div>
  );
}

export default Converter;
