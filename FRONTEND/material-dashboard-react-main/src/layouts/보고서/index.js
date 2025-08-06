import React, { useState } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import DataTable from "examples/Tables/DataTable";

// projectsTableData 파일에 구현한 커스텀 훅 불러오기 (또는 API 연동 훅)
import useProjectsTableData from "layouts/보고서/data/projectsTableData";

// 제목 컬럼 셀 컴포넌트 (다운로드 링크 포함)
function TitleCell({ row }) {
  return (
    <a
      href={`http://localhost:8090/reportlist/download?fileName=${encodeURIComponent(
        row.original.reportFile
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
      download
    >
      {row.original.title}
    </a>
  );
}
TitleCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      reportFile: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
function Billing() {
  // 검색어, 필터 상태
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("title");
  const [anchorEl, setAnchorEl] = useState(null);

  // 날짜 필터 상태 (중복 선언 제거)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // API에서 컬럼과 행 데이터 받아오기 (날짜 필터 인자 전달)
  const { columns, rows } = useProjectsTableData(startDate, endDate);

  // 제목 컬럼에 다운로드 링크 Cell 추가
  const columnsWithDownload = columns.map((col) => {
    if (col.accessor === "title") {
      return {
        ...col,
        Cell: TitleCell,
      };
    }
    return col;
  });

  // 필터링된 데이터 계산
  const filteredRows = rows.filter((item) => {
    const text = searchText.toLowerCase();

    // originDate가 "2025-08-01T..." 형식 문자열이라 startDate/endDate와 비교하기 위해 Date 객체로 변환
    const itemDate = new Date(item.originDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // 날짜 필터 (item.date 포맷 주의)
    const isDateInRange = (!start || itemDate >= start) && (!end || itemDate <= end);
    if (!isDateInRange) return false;

    // 텍스트 필터링 조건
    if (filterType === "title") {
      return item.title?.toLowerCase().includes(text);
    } else if (filterType === "author") {
      return item.author?.toLowerCase().includes(text);
    } else if (filterType === "all") {
      return item.title?.toLowerCase().includes(text) || item.author?.toLowerCase().includes(text);
    }
    return true;
  });

  // 필터 메뉴 열기/닫기 이벤트
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleMenuItemClick = (type) => {
    setFilterType(type);
    handleClose();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              {/* 필터 바 */}
              <MDBox
                mx={2}
                mt={2}
                mb={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={2}
              >
                {/* 왼쪽: 필터 버튼 + 검색 입력 */}
                <MDBox display="flex" alignItems="center" gap={2} flexGrow={1}>
                  <Button
                    variant="outlined"
                    onClick={handleClick}
                    sx={{
                      fontSize: "12px",
                      color: "black !important",
                      borderColor: "gray",
                      backgroundColor: "white",
                      minWidth: "120px",
                      fontWeight: "bold",
                      textTransform: "none",
                    }}
                  >
                    {filterType === "title"
                      ? "제목"
                      : filterType === "author"
                      ? "작성자"
                      : "제목+작성자"}
                  </Button>

                  <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={() => handleMenuItemClick("title")}>제목</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("author")}>작성자</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("all")}>제목+작성자</MenuItem>
                  </Menu>

                  <TextField
                    label="검색"
                    variant="outlined"
                    size="small"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    sx={{ backgroundColor: "white", borderRadius: 1, width: 300 }}
                  />
                </MDBox>

                {/* 오른쪽: 날짜 필터 */}
                <MDBox display="flex" alignItems="center" gap={1}>
                  <TextField
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={{ backgroundColor: "white", borderRadius: 1 }}
                  />
                  <span>~</span>
                  <TextField
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    sx={{ backgroundColor: "white", borderRadius: 1 }}
                  />
                </MDBox>
              </MDBox>

              {/* 데이터 테이블 출력 */}
              <MDBox pt={3}>
                <DataTable
                  table={{ columns: columnsWithDownload, rows: filteredRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Billing;
