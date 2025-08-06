import React from "react";
import { Typography, Box, Divider, Paper, Stack } from "@mui/material";
import 메가폰 from "layouts/img/메가폰2.png";

const notices = [
  "[공지] 7월 5일(금) 전기설비 점검 예정",
  "[안내] 안전장비 착용 준수 안전 강의 공지 일정",
  "[공지] 무더위 쉼터 이용 안내",
  "[모집] 7월 안전 교육 신청 안내",
];

function NoticeSection() {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "16px",
        p: 3,
        background: "linear-gradient(135deg, #f9fafe, #e9ecf5)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        border: "1px solid rgba(230,230,255,0.6)",
      }}
    >
      {/* 제목 */}
      <Box display="flex" alignItems="center" mb={2}>
        <img
          src={메가폰}
          alt="공지 아이콘"
          style={{
            width: 45,
            height: 45,
            marginRight: 12,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          }}
        />
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.15rem", color: "#333" }}>
          공지사항
        </Typography>
      </Box>

      <Divider
        sx={{
          mb: 2,
          borderBottomWidth: 2,
          borderColor: "rgba(0,0,0,0.1)",
        }}
      />

      {/* 항목들 */}
      <Stack spacing={1.5}>
        {notices.map((notice, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: "#ffffff",
              p: 2,
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: "all 0.25s ease",
              border: "1px solid rgba(230,230,230,0.5)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                backgroundColor: "#f7faff",
              },
            }}
          >
            <Typography sx={{ fontSize: "0.95rem", color: "#444" }}>
              {index + 1}. {notice}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default NoticeSection;
