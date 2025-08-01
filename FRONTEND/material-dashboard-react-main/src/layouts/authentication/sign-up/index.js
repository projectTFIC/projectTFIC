// File: src/layouts/authentication/sign-up/index.js

import React from "react";
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
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PropTypes from "prop-types";
// 왼쪽 로고 이미지
import LOGO_IMG from "assets/images/logo.png";
// 레이아웃 숨김용 컨텍스트
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
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: { backgroundColor: "#E2EFF8", borderRadius: 10 },
      },
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

export default function SignUp() {
  // layout="page" 설정 → 사이드바 숨김
  const [, dispatch] = useMaterialUIController();
  React.useEffect(() => {
    setLayout(dispatch, "page");
  }, [dispatch]);

  const [values, setValues] = React.useState({
    name: "",
    dob: null, // 생년월일
    department: "",
    phone: "",
    emailLocal: "",
    emailDomain: "gmail.com", // 초기 도메인
    id: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [passMatch, setPassMatch] = React.useState(true);
  const [openTOS, setOpenTOS] = React.useState(false);
  const [hasViewedTOS, setHasViewedTOS] = React.useState(false);

  // 비밀번호 일치 실시간 검사
  React.useEffect(() => {
    setPassMatch(values.confirmPassword === "" || values.password === values.confirmPassword);
  }, [values.password, values.confirmPassword]);

  const handleChange = (prop) => (e) => {
    let val = e.target.value;
    if (prop === "phone") {
      val = val.replace(/\D/g, "");
      if (val.length > 3 && val.length <= 7) {
        val = `${val.slice(0, 3)}-${val.slice(3)}`;
      } else if (val.length > 7) {
        val = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`;
      }
    }
    setValues((prev) => ({ ...prev, [prop]: val }));
  };

  const handleDOBChange = (date) => {
    setValues((prev) => ({ ...prev, dob: date }));
  };

  const handleDomainChange = (e) => setValues((prev) => ({ ...prev, emailDomain: e.target.value }));

  const toggleShowPassword = () => setShowPassword((v) => !v);
  const toggleShowConfirm = () => setShowConfirm((v) => !v);
  const handleAgree = (e) => setValues((prev) => ({ ...prev, agree: e.target.checked }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!values.agree) {
      alert("약관에 동의해주세요.");
      return;
    }
    const email = `${values.emailLocal}@${values.emailDomain}`;
    console.log("회원가입 데이터:", { ...values, email });
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
            alignItems: "flex-start",
            gap: { xs: 0, md: 8 },
            width: "100%",
            maxWidth: 960,
          }}
        >
          {/* LEFT: 로고 + 안전 메시지 */}
          <Box
            sx={{
              flex: 1,
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={LOGO_IMG}
              alt="Logo"
              sx={{
                width: "100%",
                maxWidth: 600,
                objectFit: "contain",
              }}
            />
            <Typography
              variant="h5"
              align="center"
              color="text.primary"
              sx={{ mt: 3, fontWeight: 700 }}
            >
              공사현장 안전 감지 알림 시스템
            </Typography>
          </Box>

          {/* RIGHT: 회원가입 폼 */}
          <Box sx={{ flex: 1, maxWidth: 360 }}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography
                variant="h4"
                align="center"
                sx={{ fontWeight: 700, mb: 1, letterSpacing: 1 }}
              >
                회원가입
              </Typography>

              <TextField
                label="이름"
                value={values.name}
                onChange={handleChange("name")}
                required
                fullWidth
                InputLabelProps={{ required: false }}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="생년월일"
                  value={values.dob}
                  onChange={handleDOBChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                      InputLabelProps={{ required: false }}
                    />
                  )}
                />
              </LocalizationProvider>

              <TextField
                label="부서"
                value={values.department}
                onChange={handleChange("department")}
                required
                fullWidth
                InputLabelProps={{ required: false }}
              />

              <TextField
                label="전화번호"
                placeholder="010-1234-5678"
                value={values.phone}
                onChange={handleChange("phone")}
                required
                fullWidth
                InputLabelProps={{ required: false }}
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  label="이메일 입력"
                  placeholder="username"
                  value={values.emailLocal}
                  onChange={handleChange("emailLocal")}
                  required
                  fullWidth
                  InputLabelProps={{ required: false }}
                />
                <Typography sx={{ fontSize: 18 }}>@</Typography>
                <FormControl fullWidth sx={{ minWidth: 120 }}>
                  <InputLabel>도메인</InputLabel>
                  <Select value={values.emailDomain} label="도메인" onChange={handleDomainChange}>
                    <MenuItem value="gmail.com">gmail.com</MenuItem>
                    <MenuItem value="naver.com">naver.com</MenuItem>
                    <MenuItem value="daum.net">daum.net</MenuItem>
                    <MenuItem value="outlook.com">outlook.com</MenuItem>
                    <MenuItem value="hotmail.com">hotmail.com</MenuItem>
                    <MenuItem value="yahoo.com">yahoo.com</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  label="아이디"
                  value={values.id}
                  onChange={handleChange("id")}
                  required
                  fullWidth
                  InputLabelProps={{ required: false }}
                />
                <Button
                  variant="outlined"
                  onClick={() => alert("아이디 중복확인")}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  중복확인
                </Button>
              </Box>

              <TextField
                label="비밀번호"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={handleChange("password")}
                error={!passMatch}
                helperText={!passMatch ? "비밀번호가 일치하지 않습니다." : ""}
                required
                fullWidth
                InputLabelProps={{ required: false }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowPassword}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="비밀번호 확인"
                type={showConfirm ? "text" : "password"}
                value={values.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={!passMatch}
                helperText={!passMatch ? "비밀번호가 일치하지 않습니다." : ""}
                required
                fullWidth
                InputLabelProps={{ required: false }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowConfirm}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.agree}
                    onChange={handleAgree}
                    disabled={!hasViewedTOS}
                  />
                }
                label={
                  <>
                    약관에 동의합니다.&nbsp;
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => {
                        setOpenTOS(true);
                        setHasViewedTOS(true);
                      }}
                    >
                      전체보기
                    </Link>
                  </>
                }
              />

              <Button type="submit" variant="contained" color="primary" fullWidth>
                회원가입
              </Button>

              <Box textAlign="center">
                이미 계정이 있으신가요? <Link href="/authentication/sign-in">로그인</Link>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 약관 전문 모달 */}
        <Dialog open={openTOS} onClose={() => setOpenTOS(false)} maxWidth="sm" fullWidth>
          <DialogTitle>서비스 이용 약관</DialogTitle>
          <DialogContent dividers>
            <Typography paragraph>제1조 (목적) 본 약관은 OOO 서비스 이용과 관련하여...</Typography>
            <Typography paragraph>제2조 (정의) “서비스”란...</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTOS(false)}>닫기</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

SignUp.propTypes = {
  // 필요 시 props 타입 정의
};
