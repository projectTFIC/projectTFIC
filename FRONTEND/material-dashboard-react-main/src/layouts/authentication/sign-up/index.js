// File: src/layouts/authentication/components/Cover.js
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
Coded by www.creative-tim.com
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React, { useState } from "react";
import axios from "axios";
// react-router-dom components
import { Link } from "react-router-dom";
// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";
// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

export default function Cover() {
  const [user_id, setuser_id] = useState("");
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  const [checkMessage, setCheckMessage] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  // 아이디 중복확인 버튼 클릭 핸들러 (실제 로직 연결 필요)
  const handleCheckId = async () => {
    if (!user_id.trim()) {
      alert("아이디를 입력해 주세요.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:8090/web/api/usersidcheck", {
        user_id: user_id,
      });
      if (response.data.isAvailable) {
        setIsIdAvailable(true);
        setCheckMessage("사용 가능한 아이디입니다.");
      } else {
        setIsIdAvailable(false);
        setCheckMessage("이미 사용 중인 아이디입니다.");
      }
    } catch (error) {
      alert("중복 확인 중 오류가 발생했습니다.");
      setIsIdAvailable(null);
      setCheckMessage("");
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        {/* 상단 그라데이션 박스 */}
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            회원가입
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            회원가입을 위해 아래 정보를 입력해주세요.
          </MDTypography>
        </MDBox>

        {/* 폼 영역 */}
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            {/* 이름 */}
            <MDBox mb={2}>
              <MDInput type="text" label="이름" variant="standard" fullWidth />
            </MDBox>

            {/* 전화번호 */}
            <MDBox mb={2}>
              <MDInput type="tel" label="전화번호" variant="standard" fullWidth />
            </MDBox>

            {/* 아이디 + 중복확인 버튼 */}
            <MDBox mb={2} display="flex" alignItems="center" gap={1}>
              <MDInput
                type="email"
                label="아이디"
                variant="standard"
                sx={{ flexGrow: 1 }}
                value={user_id}
                onChange={(e) => {
                  const val = e.target.value;
                  // 입력 가능 여부 관련 기존 로직 유지, 단 변경 막는 로직 없앰
                  setuser_id(val);
                  setIsIdAvailable(null);
                  setCheckMessage("");
                  setIsEmailValid(validateEmail(val));
                }}
                disabled={isIdAvailable === true}
                // 중복 체크 통과 후 입력 비활성화
              />
              <MDButton
                variant="outlined"
                color="info"
                onClick={handleCheckId}
                disabled={!isEmailValid}
              >
                중복확인
              </MDButton>
            </MDBox>
            {checkMessage && (
              <MDTypography
                variant="caption"
                color={isIdAvailable ? "success.main" : "error"}
                mb={2}
              >
                {checkMessage}
              </MDTypography>
            )}
            {/* 비밀번호 */}
            <MDBox mb={2}>
              <MDInput type="password" label="비밀번호" variant="standard" fullWidth />
            </MDBox>

            {/* 비밀번호 재확인 */}
            <MDBox mb={2}>
              <MDInput type="password" label="비밀번호 확인" variant="standard" fullWidth />
            </MDBox>

            {/* 약관 동의 */}
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;[필수] 이 약관에 동의합니다.&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                전체보기
              </MDTypography>
            </MDBox>

            {/* 회원가입 완료 버튼 */}
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth>
                회원가입 완료
              </MDButton>
            </MDBox>

            {/* 로그인 링크 */}
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                이미 계정이 있으신가요?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  로그인
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}
