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

import React from "react";
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
  // 아이디 중복확인 버튼 클릭 핸들러 (실제 로직 연결 필요)
  const handleCheckId = () => {
    alert("아이디 중복확인 로직을 구현하세요.");
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
              <MDInput type="text" label="아이디" variant="standard" sx={{ flexGrow: 1 }} />
              <MDButton variant="outlined" color="info" onClick={handleCheckId}>
                중복확인
              </MDButton>
            </MDBox>

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
