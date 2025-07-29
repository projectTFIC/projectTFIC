// ✅ React 및 MUI(Material-UI) 기본 컴포넌트 import
import React, { useState } from "react";
import PropTypes from "prop-types";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// ✅ 제목 클릭 시 본문을 펼치는 커스텀 셀 컴포넌트 정의
function TitleCell({ row }) {
  const { no, title, content } = row.original;
  const [open, setOpen] = useState(false); // 펼침 여부 상태

  return (
    <Box>
      {/* 제목 영역 - 클릭하면 본문이 토글 */}
      <Typography sx={{ cursor: "pointer", fontWeight: "bold" }} onClick={() => setOpen(!open)}>
        {title}
      </Typography>

      {/* 본문 영역 - Collapse 컴포넌트로 애니메이션 처리 */}
      <Collapse in={open}>
        <Typography sx={{ mt: 1, color: "#555" }}>{content}</Typography>
      </Collapse>
    </Box>
  );
}

// ✅ 타입 검사 설정 (PropTypes)
// - ESLint 또는 런타임 에러 방지용
TitleCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      no: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

// ✅ 데이터 테이블에 전달할 컬럼 정보와 행(row) 정보 정의
export default function authorsTableData() {
  // 📌 테이블 컬럼 정의
  const columns = [
    { Header: "NO.", accessor: "no", align: "center" }, // 번호
    {
      Header: "제목",
      accessor: "title",
      align: "left",
      Cell: TitleCell, // 제목 클릭 시 본문 열리는 커스텀 셀
    },
    { Header: "작성자", accessor: "author", align: "center" },
    { Header: "날짜", accessor: "date", align: "center" },
  ];

  // 📌 테이블에 표시할 실제 데이터 (행 목록)
  const rows = [
    {
      no: 1,
      title: "작업자 위험 행동 감지",
      content: "작업자가 안전수칙을 지키지 않고 있습니다.",
      author: "차주한",
      date: "2025-07-18",
    },
    {
      no: 2,
      title: "중장비 접근 감지",
      content: "작업구역 내에 중장비가 진입했습니다.",
      author: "이도현",
      date: "2025-07-16",
    },
    {
      no: 3,
      title: "보호장비 미착용",
      content: "헬멧 및 안전조끼 미착용이 감지되었습니다.",
      author: "기 융",
      date: "2025-06-25",
    },
    {
      no: 4,
      title: "보호장비 미착용",
      content: "헬멧 및 안전조끼 미착용이 감지되었습니다.",
      author: "이정민",
      date: "2025-07-10",
    },
    {
      no: 5,
      title: "보호장비 미착용",
      content: "헬멧 및 안전조끼 미착용이 감지되었습니다.",
      author: "조명현",
      date: "2025-06-12",
    },
  ];

  // ✅ columns(컬럼 정보), rows(데이터) 반환
  return { columns, rows };
}
