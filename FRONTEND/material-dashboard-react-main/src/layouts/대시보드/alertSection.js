// src/layouts/대시보드/AlertSection.js
import React from "react";
import { Typography, Box, Divider } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const alerts = [
  "[안내] 오늘 기준 CCTV 2번, 6번 카메라 녹화 이상 감지",
  "[이벤트] 우수 안전 착용자 포상 추천 접수 중",
  "[권장] 오늘 기온 32도 이상, 무더위 휴식시간 적극 활용 바랍니다",
  "[업데이트] AI 안전시스템 정기점검 완료",
];

function AlertSection() {
  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight={700}
        mb={1}
        display="flex"
        alignItems="center"
        sx={{ fontSize: "1.1rem" }}
      >
        알림사항 <WarningAmberIcon fontSize="small" sx={{ ml: 1 }} />
      </Typography>

      {/* 👉 굵은 구분선 */}
      <Divider sx={{ mb: 2, borderBottomWidth: 2 }} />

      {alerts.map((alert, index) => (
        <Box key={index} mb={1.5}>
          <Typography sx={{ fontSize: "0.95rem", color: "#333" }}>
            {index + 1}. {alert}
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

export default AlertSection;
