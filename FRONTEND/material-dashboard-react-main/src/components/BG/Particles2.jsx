// src/components/BG/Particles2.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function Particles2({ id = "tsparticles", options: userOptions }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      if (mounted) setReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: -1 },
      background: {
        color: {
          // 딥 네이비 단색
          value: "#0f172a",
        },
      },
      particles: {
        number: { value: 90, density: { enable: true, area: 800 } },
        // 파티클 색상: 블루·밝은 블루·화이트
        color: { value: ["#3b82f6", "#60a5fa", "#ffffff"] },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 3 } },
        links: {
          enable: true,
          distance: 150,
          color: "#3b82f6",
          opacity: 0.2,
        },
        move: { enable: true, speed: 0.6, outModes: { default: "out" } },
      },
      detectRetina: true,
      ...(userOptions || {}),
    }),
    [userOptions]
  );

  if (!ready) return null;
  return <Particles id={id} options={options} />;
}

Particles2.propTypes = {
  id: PropTypes.string,
  options: PropTypes.object,
};
