import React from "react";
import {
  Stack,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CCTV_IMG from "assets/images/login.png";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useMaterialUIController, setLayout, useAuthController } from "context";
import { Link as RouterLink, useNavigate } from "react-router-dom";

function SignIn() {
  // ✅ 전역 상태 & 네비게이션
  const [, dispatch] = useMaterialUIController();
  const { login } = useAuthController();
  const navigate = useNavigate();

  React.useEffect(() => {
    setLayout(dispatch, "page");
  }, [dispatch]);

  // ✅ 입력값 상태
  const [values, setValues] = React.useState({
    user_id: "",
    password: "",
    showPassword: false,
  });

  const handleChange = (prop) => (e) => setValues({ ...values, [prop]: e.target.value });

  const toggleShowPassword = () =>
    setValues((prev) => ({ ...prev, showPassword: !prev.showPassword }));

  // ✅ 로그인 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8090/web/GoLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: values.user_id,
          password: values.password,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
        } else {
          alert("로그인 중 오류가 발생했습니다.");
        }
        return;
      }

      const user = await res.json();
      login(user);
      console.log("로그인 성공 사용자 정보:", user);
      navigate("/dashboard");
    } catch (error) {
      console.error("로그인 요청 중 오류:", error);
      alert("서버와 통신 중 문제가 발생했습니다.");
    }
  };

  // ✅ Vanta NET 배경
  const [vantaEffect, setVantaEffect] = React.useState(null);
  const vantaRef = React.useRef(null);

  React.useEffect(() => {
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

      const originalUpdate = effect.update;
      const speedFactor = 0.3;
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
    <Box
      ref={vantaRef}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#0e1a1f",
        p: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          minHeight: "600px",
          display: "flex",
          flexGrow: 1,
          background: "rgba(255,255,255,0.05)",
          borderRadius: "20px",
          overflow: "hidden",
          p: 4,
          gap: 6,
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(59,183,143,0.5) 0%, transparent 70%)",
            filter: "blur(80px)",
            zIndex: 0,
          },
        }}
      >
        {/* 왼쪽 로그인 폼 */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            pr: 4,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: "GmarketSans",
              mb: 3,
              color: "#fff",
              mx: "auto",
              fontWeight: 600,
            }}
          >
            로그인
          </Typography>

          <TextField
            fullWidth
            placeholder="ID"
            variant="outlined"
            value={values.user_id}
            onChange={handleChange("user_id")}
            sx={{
              mb: 2,
              backgroundColor: "#fff",
              borderRadius: "8px",
            }}
          />
          <TextField
            fullWidth
            placeholder="Password"
            type={values.showPassword ? "text" : "password"}
            variant="outlined"
            value={values.password}
            onChange={handleChange("password")}
            sx={{
              mb: 1,
              backgroundColor: "#fff",
              borderRadius: "8px",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={toggleShowPassword}>
                    {values.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography
            variant="body2"
            sx={{ textAlign: "right", mb: 3, cursor: "pointer", color: "#fff" }}
          >
            Forgot Password
          </Typography>
          <Stack spacing={2}>
            <Button
              type="submit"
              fullWidth
              sx={{
                backgroundColor: "#3bb78f",
                color: "#fff",
                py: 1.5,
                fontWeight: 500,
                borderRadius: "8px",
                fontFamily: "GmarketSans",
                "&:hover": { backgroundColor: "#329e7b" },
              }}
            >
              로그인
            </Button>
            <Button
              type="button"
              component={RouterLink}
              to="/authentication/sign-up"
              fullWidth
              sx={{
                backgroundColor: "#3bb78f",
                fontFamily: "GmarketSans",
                color: "#fff",
                py: 1.5,
                fontWeight: 500,
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#329e7b" },
              }}
            >
              회원가입
            </Button>
          </Stack>
        </Box>

        {/* 오른쪽 소개 영역 */}
        <Box
          sx={{
            flex: 1,
            background: "rgba(59,183,143,0.3)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
            p: 4,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            component="img"
            src={CCTV_IMG}
            alt="CCTV"
            sx={{
              ml: "20px",
              display: "block",
              width: "100%",
              height: "auto",
              objectFit: "contain",
              mb: 3,
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontFamily: "Airbeat",
              fontSize: "4.2rem",
              color: "White",
              fontWeight: 600,
              mb: 1,
            }}
          >
            AIVIS
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "GmarketSans",
              mb: 3.5,
              color: "White",
              fontWeight: 300,
              fontSize: "0.8rem",
            }}
          >
            AI 기반 CCTV 감지 시스템으로
            <br />
            건설 현장의 사고를 사전에 감지하고 예방합니다.
          </Typography>

          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              color: "#000",
              p: 3,
              mt: "auto",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontSize: "0.8rem", fontWeight: "bold", mb: 1 }}>
              With our AI-based CCTV detection system, we detect and prevent construction site
              accidents in advance.
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#555" }}>
              Be among the first founders to experience the easiest way to start run a business.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default SignIn;
