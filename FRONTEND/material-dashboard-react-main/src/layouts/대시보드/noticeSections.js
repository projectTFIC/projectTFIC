// src/layouts/대시보드/NoticeSection.js
import React from "react";
import { Typography, Box, Divider, Paper, Stack } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import 메가폰 from "layouts/img/알리미.png";

const notices = [
  "[공지] 7월 5일(금) 전기설비 점검 예정",
  "[안내] 안전장비 착용 준수 안전 강의 공지 일정",
  "[공지] 무더위 쉼터 이용 안내",
  "[모집] 7월 안전 교육 신청 안내",
];

function NoticeSection() {
  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: 3,
        p: 3,
        background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* 제목 */}
      <Box display="flex" alignItems="center" mb={2}>
        {<img src={메가폰} alt="사고 아이콘" style={{ width: 30, height: 30, marginRight: 9 }} />}
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.15rem", color: "#333" }}>
          공지사항
        </Typography>
      </Box>

      <Divider sx={{ mb: 2, borderBottomWidth: 2 }} />

      {/* 항목들 */}
      <Stack spacing={1.5}>
        {notices.map((notice, index) => (
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
              {index + 1}. {notice}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default NoticeSection;
