import { Rnd } from "react-rnd";

function Cropper(props: {
  videoSize: { w: number; h: number };
  videoRef: React.RefObject<HTMLVideoElement>;
  viewPos: { x: number; y: number };
  setViewPos: (pos: { x: number; y: number }) => void;
  viewSize: { w: number; h: number };
  setViewSize: (size: { w: number; h: number }) => void;
}) {
  const { videoRef, viewPos, setViewPos, viewSize, setViewSize } = props;

  return (
    <Rnd
      className="Cropper"
      defaultSize={{
        width: 400,
        height: 400,
      }}
      disableDragging={false}
      enableResizing={{
        left: true,
        right: true,
        top: true,
        bottom: true,
      }}
      bounds={videoRef.current || "parent"}
      position={{
        x: viewPos.x,
        y: viewPos.y,
      }}
      size={{
        width: viewSize.w,
        height: viewSize.h,
      }}
      onResize={(_e, _direction, ref, _delta, position) => {
        setViewSize({
          w: ref.offsetWidth,
          h: ref.offsetHeight,
        });
        setViewPos({
          ...position,
        });
      }}
      onDragStop={(_e, position) => {
        setViewPos({
          ...position,
        });
      }}
    ></Rnd>
  );
}

export default Cropper;
