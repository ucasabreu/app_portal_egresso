export default function Photo({ src, alt = "", fallback = "/demo/avatar.svg", ...props }) {
  return (
    <img
      {...props}
      src={src || fallback}
      alt={alt}
      loading={props.loading || "lazy"}
      onError={event => {
        const image = event.currentTarget;
        if (image.getAttribute("src") !== fallback) image.src = fallback;
      }}
    />
  );
}
