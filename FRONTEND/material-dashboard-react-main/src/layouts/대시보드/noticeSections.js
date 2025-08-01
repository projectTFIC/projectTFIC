// src/layouts/대시보드/NoticeSection.js
import React from "react";
import { Typography, Box, Divider } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const notices = [
  "[공지] 7월 5일(금) 전기설비 점검 예정",
  "[안내] 안전장비 착용 준수 안전 강의 공지 일정",
  "[공지] 무더위 쉼터 이용 안내",
  "[모집] 7월 안전 교육 신청 안내",
];

function NoticeSection() {
  return (
    <Box>
      {/* 제목 */}
      <Typography
        variant="h6"
        fontWeight={700}
        mb={1}
        display="flex"
        alignItems="center"
        sx={{ fontSize: "1.1rem" }}
      >
        공지사항 <EmojiEventsIcon fontSize="small" sx={{ ml: 1 }} />
      </Typography>

      {/* 제목 아래 구분선 */}
      <Divider sx={{ mb: 2, borderBottomWidth: 2 }} />

      {/* 항목들 */}
      {notices.map((notice, index) => (
        <Box key={index} mb={1.5}>
          <Typography
            sx={{
              fontSize: "0.95rem",
              color: "#333",
            }}
          >
            {index + 1}. {notice}
          </Typography>
          {/* 항목 구분선 */}
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

export default NoticeSection;
