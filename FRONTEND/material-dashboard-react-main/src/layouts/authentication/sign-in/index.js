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
  Link as MuiLink,
  Divider,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PropTypes from "prop-types";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import CCTV_IMG from "assets/images/login.png";
import { useMaterialUIController, setLayout } from "context";

const theme = createTheme({
  palette: {
    primary: { main: "#193C56" },
    secondary: { main: "#6DBE8D" },
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
        input: { paddingTop: 12, paddingBottom: 12 },
      },
    },
  },
});

function SignIn() {
  const [, dispatch] = useMaterialUIController();
  React.useEffect(() => {
    setLayout(dispatch, "page");
  }, [dispatch]);

  const navigate = useNavigate();

  const [values, setValues] = React.useState({
    user_id: "",
    password: "",
    showPassword: false,
  });

  const handleChange = (prop) => (e) => setValues({ ...values, [prop]: e.target.value });

  const toggleShowPassword = () =>
    setValues((prev) => ({ ...prev, showPassword: !prev.showPassword }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8090/web/GoLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 세션 유지용 쿠키 포함
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
      console.log("로그인 성공 사용자 정보:", user);

      // 로그인 성공 시 대시보드 페이지로 이동
      navigate("/dashboard");
    } catch (error) {
      console.error("로그인 요청 중 오류:", error);
      alert("서버와 통신 중 문제가 발생했습니다.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 0, md: 30 },
            maxWidth: 960,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              width: 440,
            }}
          >
            <Box sx={{ maxWidth: 420, width: "100%", textAlign: "left" }}>
              <Box
                sx={{
                  mx: "auto",
                  mb: 3,
                  width: "100%",
                  maxWidth: 420,
                  overflow: "visible",
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
                    objectFit: "contain",
                  }}
                />
              </Box>
              <Box sx={{ textAlign: "center", ml: { md: -10 } }}>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1.5 }}>
                  <PageDot filled />
                  <PageDot />
                  <PageDot />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  공사현장 cctv 감지 알림 시스템
                </Typography>
              </Box>
            </Box>
          </Box>

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
                value={values.user_id}
                onChange={handleChange("user_id")}
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
                      <IconButton edge="end" onClick={toggleShowPassword}>
                        {values.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5, mb: 2 }}>
                <MuiLink
                  href="#"
                  underline="none"
                  sx={{ color: "text.secondary", fontSize: 13 }}
                ></MuiLink>
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
                component={RouterLink}
                to="/authentication/sign-up"
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

export default SignIn;
