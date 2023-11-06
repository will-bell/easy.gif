import { Slider } from "@mui/material";

function EditorControls(props: {
  videoRef: React.RefObject<HTMLVideoElement>;
  setVideoSource: (source: string) => void;
  videoTrim: { start: number; end: number };
  setVideoTrim: (trim: { start: number; end: number }) => void;
}) {
  const { videoRef, setVideoSource, videoTrim, setVideoTrim } = props;
  return (
    <>
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
        onChange={
          (event: React.ChangeEvent<HTMLInputElement>) => {
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
          }
        }
        className="hidden-file-input"
        id="fileInput"
      ></input>
      <label htmlFor="fileInput" className="button-facade">
        Upload File
      </label>
    </>
  )
}

export default EditorControls