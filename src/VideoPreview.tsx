import { useEffect } from "react";

function VideoPreview(props: {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoSource: string;
  setVideoSize: (size: { w: number; h: number }) => void;
}) {
  const { videoRef, videoSource, setVideoSize } = props;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const handleVideoLoad = () => {
      // const { videoWidth, videoHeight, duration } = video as HTMLVideoElement;
      setVideoSize({ w: video.offsetWidth, h: video.offsetHeight });
    };

    video.addEventListener("loadedmetadata", handleVideoLoad);

    return () => {
      video.removeEventListener("loadedmetadata", handleVideoLoad);
    };
  }, [videoRef, setVideoSize]);

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

  useEffect(() => {
    console.log("video load");
  });

  return (
    <video
      className="VideoPreview"
      ref={videoRef}
      src={videoSource}
      controls={false}
      autoPlay={true}
    />
  );
}

export default VideoPreview;
