import * as React from "react";
import {
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Link,
  Divider,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PropTypes from "prop-types";

// 👉 프로젝트에 맞게 이미지 경로 교체
import CCTV_IMG from "layouts/img/로그인.png";

// 로그인 화면에서 사이드바가 나오지 않도록 레이아웃 상태 제어
import { useMaterialUIController, setLayout } from "context";

const theme = createTheme({
  palette: {
    primary: { main: "#193C56" }, // 네이비 버튼/텍스트
    secondary: { main: "#6DBE8D" }, // 그린 버튼
    text: { primary: "#1A2A36", secondary: "#5E6A75" },
    grey: { 100: "#E2EFF8", 300: "#D3DEE8" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: [
      "Pretendard",
      "Noto Sans KR",
      "Apple SD Gothic Neo",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiTextField: {
      styleOverrides: { root: { backgroundColor: "#E2EFF8", borderRadius: 10 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": { border: "1px solid transparent" },
          "&:hover fieldset": { border: "1px solid #D3DEE8" },
          "&.Mui-focused fieldset": { border: "1px solid #193C56" },
        },
        input: { paddingTop: 12, paddingBottom: 12 }, // 살짝 컴팩트
      },
    },
  },
});

function Basic() {
  // 로그인 화면에서 사이드바 숨김 (layout !== "dashboard")
  const [, dispatch] = useMaterialUIController();
  React.useEffect(() => {
    setLayout(dispatch, "page");
  }, [dispatch]);

  const [values, setValues] = React.useState({
    id: "",
    password: "",
    showPassword: false,
  });

  const handleChange = (prop) => (e) => setValues({ ...values, [prop]: e.target.value });
  const toggleShowPassword = () =>
    setValues((prev) => ({ ...prev, showPassword: !prev.showPassword }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 실제 로그인 로직 연결
    console.log("login with", values);
  };

  return (
    <ThemeProvider theme={theme}>
      {/* 화면 정중앙 정렬 */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#FFFFFF",
          px: { xs: 2, md: 4 },
        }}
      >
        {/* 가운데 래퍼: 폭 축소 + 간격 축소 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 0, md: 30 },
            maxWidth: 960, // 전체 폭
            width: "100%",
          }}
        >
          {/* LEFT: 이미지 (md 이상에서 보이기) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              width: 440, // 왼쪽 영역 폭 (로그인 박스에 영향 X)
            }}
          >
            <Box sx={{ maxWidth: 420, width: "100%", textAlign: "left" }}>
              {/* 이미지 래퍼 */}
              <Box
                sx={{
                  mx: "auto",
                  mb: 3,
                  width: "100%",
                  maxWidth: 420, // 부모(440) 내에서 이미지 최대 너비
                  borderRadius: 0,
                  overflow: "visible", // 내부 이미지 확대 시 잘림 방지
                }}
              >
                <Box
                  component="img"
                  src={CCTV_IMG}
                  alt="CCTV"
                  sx={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    aspectRatio: "16 / 10",
                    objectFit: "contain", // 원형 배경 안 잘리게
                    transform: "scale(1.12)", // 시각적 확대 (레이아웃 영향 없음)
                    transformOrigin: "center",
                    objectPosition: "center",
                    background: "transparent",
                    borderRadius: 0,
                    boxShadow: "none",
                  }}
                />
              </Box>

              {/* 문구박스 래퍼: 문구만 살짝 왼쪽으로 이동 */}
              <Box
                sx={{
                  textAlign: "center",
                  ml: { md: -10 }, // md 이상에서 약 -8px 이동 (원하는 값으로 조정)
                  // 픽셀 단위로 조절하고 싶다면 아래 한 줄로 대체하세요:
                  // transform: "translateX(-6px)",
                }}
              >
                {/* 페이지 인디케이터(작은 점) */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1.5 }}>
                  <PageDot filled />
                  <PageDot />
                  <PageDot />
                </Box>

                {/* 아래 문구: 가운데 정렬 유지 */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }} align="center">
                  Always monitoring your day
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                  align="center"
                >
                  On the shot, you see the main screen with all the rooms, and users can control
                  each camera with the help of remote control
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* RIGHT: 로그인 폼 */}
          <Box
            sx={{
              width: { xs: "100%", md: 360 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: 800, mb: 3, color: "#152635" }}
              >
                로그인
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="ID"
                variant="outlined"
                value={values.id}
                onChange={handleChange("id")}
                sx={{ mb: 1.5 }}
                inputProps={{ inputMode: "text", autoComplete: "username" }}
              />

              <TextField
                fullWidth
                size="small"
                label="Password"
                variant="outlined"
                type={values.showPassword ? "text" : "password"}
                value={values.password}
                onChange={handleChange("password")}
                inputProps={{ autoComplete: "current-password" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={toggleShowPassword}
                        aria-label="비밀번호 보기"
                      >
                        {values.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5, mb: 2 }}>
                <Link href="#" underline="none" sx={{ color: "text.secondary", fontSize: 13 }}>
                  Recovery Password
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                sx={{
                  bgcolor: "primary.main",
                  py: 1.25,
                  borderRadius: 10,
                  fontSize: 15,
                  "&:hover": { bgcolor: "#112C40" },
                }}
              >
                로그인
              </Button>

              <Button
                fullWidth
                variant="contained"
                size="medium"
                sx={{
                  bgcolor: "secondary.main",
                  py: 1.25,
                  borderRadius: 10,
                  mt: 1,
                  fontSize: 15,
                  "&:hover": { bgcolor: "#5FB381" },
                }}
              >
                회원가입
              </Button>

              <Divider sx={{ mt: 3, opacity: 0 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

/** 작은 도트 컴포넌트 (페이지 인디케이터 느낌) */
function PageDot({ filled = false }) {
  return (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: filled ? "#193C56" : "#D6DFE7",
        transition: "all .2s",
      }}
    />
  );
}

PageDot.propTypes = {
  filled: PropTypes.bool,
};

export default Basic;
