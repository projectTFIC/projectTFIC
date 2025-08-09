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
import LOGO_IMG from "assets/images/logo.png";
import { useMaterialUIController, setLayout } from "context";
import { motion } from "framer-motion";
import HyperspeedBackground from "layouts/Hyperspeed";

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

// 전화번호 유효성 함수 (010-1234-5678 형식만 허용)
function isValidPhone(phone) {
  return /^01[016789]-\d{3,4}-\d{4}$/.test(phone);
}

export default function SignUp() {
  const [, dispatch] = useMaterialUIController();
  React.useEffect(() => {
    setLayout(dispatch, "page");
  }, [dispatch]);

  // 폼 상태
  const [values, setValues] = React.useState({
    name: "",
    dob: null,
    department: "",
    phone: "",
    emailLocal: "",
    emailDomain: "gmail.com",
    id: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [passMatch, setPassMatch] = React.useState(true);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const [openTOS, setOpenTOS] = React.useState(false);
  const [hasAgreedTOS, setHasAgreedTOS] = React.useState(false);

  const [idChecked, setIdChecked] = React.useState(false);
  const [idAvailable, setIdAvailable] = React.useState(null);

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
    if (prop === "id") {
      setIdChecked(false);
      setIdAvailable(null);
    }
    setValues((prev) => ({ ...prev, [prop]: val }));
  };

  const handleDOBChange = (date) => setValues((prev) => ({ ...prev, dob: date }));
  const handleDomainChange = (e) => setValues((prev) => ({ ...prev, emailDomain: e.target.value }));
  const toggleShowPassword = () => setShowPassword((v) => !v);
  const toggleShowConfirm = () => setShowConfirm((v) => !v);
  const handleAgree = (e) => setValues((prev) => ({ ...prev, agree: e.target.checked }));

  const handleOpenTOS = () => setOpenTOS(true);
  const handleCloseTOS = () => setOpenTOS(false);
  const handleAgreeInModal = () => {
    setHasAgreedTOS(true);
    setValues((prev) => ({ ...prev, agree: true }));
    setOpenTOS(false);
  };

  // 아이디 중복확인
  const checkIdAvailability = async () => {
    if (!values.id) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/usersidcheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: values.id }),
      });
      if (!res.ok) {
        alert("서버 오류: 중복 확인에 실패했습니다.");
        return;
      }
      const data = await res.json();
      if (data.isAvailable) {
        alert("사용 가능한 아이디입니다.");
        setIdChecked(true);
        setIdAvailable(true);
      } else {
        alert("이미 존재하는 아이디입니다. 다른 아이디를 입력해주세요.");
        setIdChecked(false);
        setIdAvailable(false);
      }
    } catch (error) {
      alert("중복 확인 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idChecked) {
      alert("아이디 중복확인을 해주세요.");
      return;
    }
    if (!passMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isValidPhone(values.phone)) {
      alert("전화번호 형식이 올바르지 않습니다. 예시: 010-1234-5678");
      return;
    }
    if (!values.agree) {
      alert("약관에 동의해주세요.");
      return;
    }

    const email = `${values.emailLocal}@${values.emailDomain}`;
    const signupData = {
      user_id: values.id,
      password: values.password,
      name: values.name,
      department: values.department,
      email: `${values.emailLocal}@${values.emailDomain}`,
      phone: values.phone,
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/GoRegister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 쿠키 세션이 필요한 경우
        body: JSON.stringify(signupData),
      });

      if (response.ok) {
        alert("회원가입이 성공적으로 완료되었습니다!");
        // 로그인 페이지로 이동 (react-router-dom useNavigate 또는 window.location)
        window.location.href = "/authentication/sign-in";
      } else {
        const errorData = await response.json();
        alert(errorData.error || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      alert("서버와 통신 중 오류가 발생했습니다.");
      console.error(error);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }} // 오른쪽에서 시작
      animate={{ opacity: 1, x: 0 }} // 중앙으로 이동
      exit={{ opacity: 0, x: -50 }} // 왼쪽으로 사라짐 (App.js에서 AnimatePresence 있을 경우)
      transition={{ duration: 0.4 }}
    >
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
              alignItems: "center", // 세로 중앙
              justifyContent: "center", // 가로 중앙
              width: "100%",
              height: "100%",
            }}
          >
            {/* RIGHT 회원가입 폼 */}
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
                    inputFormat="yyyy-MM-dd"
                    disableFuture
                    openTo="year"
                    views={["year", "month", "day"]}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        fullWidth
                        InputLabelProps={{ required: false }}
                        inputProps={{ ...params.inputProps, readOnly: true }}
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
                  error={values.phone !== "" && !isValidPhone(values.phone)}
                  helperText={
                    values.phone !== "" && !isValidPhone(values.phone)
                      ? "전화번호 형식이 올바르지 않습니다."
                      : ""
                  }
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

                {/* 아이디 + 중복확인 버튼 */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    label="아이디"
                    value={values.id}
                    onChange={handleChange("id")}
                    required
                    fullWidth
                    InputLabelProps={{ required: false }}
                    disabled={idChecked}
                  />
                  <Button
                    variant="outlined"
                    onClick={checkIdAvailability}
                    disabled={!values.id || idChecked}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    중복확인
                  </Button>
                  {idAvailable === true && (
                    <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                      사용 가능한 아이디입니다.
                    </Typography>
                  )}
                  {idAvailable === false && (
                    <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
                      이미 존재하는 아이디입니다.
                    </Typography>
                  )}
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

                {/* 약관 동의 체크박스 및 전체보기 */}
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.agree}
                        onChange={handleAgree}
                        disabled={!hasAgreedTOS}
                      />
                    }
                    label={
                      <>
                        약관에 동의합니다.&nbsp;
                        <Link
                          component="button"
                          variant="body2"
                          onClick={handleOpenTOS}
                          type="button"
                        >
                          전체보기
                        </Link>
                      </>
                    }
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />
                  {!hasAgreedTOS && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        pl: "32px",
                        lineHeight: 1.8,
                        mt: "-6px",
                        mb: 1,
                        display: "block",
                        wordBreak: "keep-all",
                        maxWidth: "100%",
                      }}
                    >
                      약관을 확인하신 후 모달에서 “동의” 버튼을 눌러주세요.
                    </Typography>
                  )}
                </Box>

                <Button type="submit" variant="contained" color="primary" fullWidth>
                  회원가입
                </Button>

                <Box textAlign="center" sx={{ mt: 1 }}>
                  이미 계정이 있으신가요? <Link href="/authentication/sign-in">로그인</Link>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 약관 모달 */}
          <Dialog open={openTOS} onClose={handleCloseTOS} maxWidth="sm" fullWidth>
            <DialogTitle>서비스 이용 약관</DialogTitle>
            <DialogContent dividers>
              <Typography paragraph>
                제1조 (목적) 본 약관은 OOO 서비스 이용과 관련하여...
              </Typography>
              <Typography paragraph>제2조 (정의) “서비스”란...</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTOS}>취소</Button>
              <Button variant="contained" onClick={handleAgreeInModal} autoFocus>
                동의
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ThemeProvider>
    </motion.div>
  );
}
