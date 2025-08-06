import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import Box from "@mui/material/Box";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "context";
import backgroundImage from "assets/images/bg.jpg";

import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      const effect = NET({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        backgroundAlpha: 1,
        backgroundColor: 0x23153c,
        color: 0x3fd1ff,
        maxDistance: 27,
        points: 14,
        spacing: 17,
      });

      // ✅ 원래 update 메서드 저장
      const originalUpdate = effect.update;
      const speedFactor = 0.3; // 속도 30%

      // ✅ 속도 조절 로직
      effect.update = function () {
        if (this.particles) {
          this.particles.forEach((p) => {
            p.x += p.vx * speedFactor;
            p.y += p.vy * speedFactor;
          });
        }
        return originalUpdate.call(this);
      };

      setVantaEffect(effect);
    }

    return () => {
      if (vantaEffect) {
        try {
          vantaEffect.destroy();
        } catch (e) {
          console.warn("Vanta destroy error:", e);
        }
      }
    };
  }, [vantaEffect]);

  return (
    <>
      {/* ✅ 고정된 배경 이미지 */}
      <Box
        ref={vantaRef}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
          width: "100vw",
          height: "100vh",
        }}
      />

      {/* ✅ 실제 콘텐츠 박스 */}
      <MDBox
        sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
          p: 3,
          position: "relative",
          minHeight: "100vh",

          [breakpoints.up("xl")]: {
            marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
            transition: transitions.create(["margin-left", "margin-right"], {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.standard,
            }),
          },
        })}
      >
        {children}
      </MDBox>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
