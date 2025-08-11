import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// MUI
import Box from "@mui/material/Box";
import MDBox from "components/MDBox";

// Context
import { useMaterialUIController, setLayout } from "context";

// BG
import Particles from "components/BG/Particles";
import Squares from "components/BG/Squares";
import "components/BG/Particles.css"; // .particles-container 스타일 사용 시
import RippleGrid from "components/BG/RippleGrid";
import "components/BG/RippleGrid.css";

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname, dispatch]);

  return (
    <>
      {/* 고정 배경 레이어 */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 0, // ⬅️ -1 말고 0
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
          pointerEvents: "none",
        }}
      ></Box>

      {/* 실제 컨텐츠 */}
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
