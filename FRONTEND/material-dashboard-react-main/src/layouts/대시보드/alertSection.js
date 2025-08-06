// src/layouts/대시보드/AlertSection.js
import React from "react";
import { Typography, Box, Divider, Paper, Stack } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import 메가폰 from "layouts/img/벨.png";

const alerts = [
  "[안내] 오늘 기준 CCTV 2번, 6번 카메라 녹화 이상 감지",
  "[이벤트] 우수 안전 착용자 포상 추천 접수 중",
  "[권장] 오늘 기온 32도 이상, 무더위 휴식시간 적극 활용 바랍니다",
  "[업데이트] AI 안전시스템 정기점검 완료",
];

function AlertSection() {
  return (
    <Paper
      elevation={4}
      sx={{
        height: "100%",
        borderRadius: "16px",
        p: 3,
        background: "linear-gradient(135deg, #f9fafe, #e9ecf5)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        border: "1px solid rgba(230,230,255,0.6)",
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        {<img src={메가폰} alt="사고 아이콘" style={{ width: 35, height: 35, marginRight: 12 }} />}
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.15rem", color: "#333" }}>
          알림사항
        </Typography>
      </Box>

      <Divider sx={{ mb: 2, borderBottomWidth: 2 }} />

      <Stack spacing={1.5}>
        {alerts.map((alert, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: "#fff",
              p: 2,
              borderRadius: 2,
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography sx={{ fontSize: "0.95rem", color: "#444" }}>
              {index + 1}. {alert}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default AlertSection;
