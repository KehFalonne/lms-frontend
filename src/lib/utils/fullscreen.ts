type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

export function getFullscreenElement(): Element | null {
  if (typeof document === "undefined") return null;

  const fullscreenDocument = document as FullscreenDocument;
  return (
    document.fullscreenElement ??
    fullscreenDocument.webkitFullscreenElement ??
    fullscreenDocument.mozFullScreenElement ??
    fullscreenDocument.msFullscreenElement ??
    null
  );
}

export function subscribeToFullscreenChange(listener: () => void) {
  if (typeof document === "undefined") return () => {};

  const events = [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange",
  ];

  events.forEach((event) => document.addEventListener(event, listener));
  return () => events.forEach((event) => document.removeEventListener(event, listener));
}
