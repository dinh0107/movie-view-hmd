"use client";

import { useEffect, useRef, useState } from "react";

export default function BottomAdBanner() {
  const adRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!adRef.current) return;

    adRef.current.innerHTML = "";

    const config = document.createElement("script");
    config.type = "text/javascript";
    config.innerHTML = `
      atOptions = {
        'key' : 'f5e6566905819a2acfb0411fcc7d5596',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//www.highperformanceformat.com/f5e6566905819a2acfb0411fcc7d5596/invoke.js";

    adRef.current.appendChild(config);
    adRef.current.appendChild(script);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/90 p-2 z-50 flex justify-center items-center">
      <button
        onClick={() => setVisible(false)}
        className="absolute top-0 right-0 m-1 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
      >
        ✕
      </button>

      <div ref={adRef} className="max-w-[728px] w-full flex justify-center" />
    </div>
  );
}
