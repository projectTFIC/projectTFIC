// ✅ React 및 MUI 기본 컴포넌트 import
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// ✅ 프로젝트 내부 공통 컴포넌트 import
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import DataTable from "examples/Tables/DataTable";

// ✅ 테이블에 표시할 데이터 (columns + rows)
import authorsTableData from "layouts/billing/data/authorsTableData";

function Billing() {
  // 🔸 검색창 관련 상태
  const [searchText, setSearchText] = useState(""); // 검색어
  const [filterType, setFilterType] = useState("title"); // 필터 타입: 제목/작성자/모두
  const [anchorEl, setAnchorEl] = useState(null); // 필터 메뉴 anchor (버튼 위치 저장)

  // 🔸 날짜 필터 상태
  const [startDate, setStartDate] = useState(""); // 시작일
  const [endDate, setEndDate] = useState(""); // 종료일

  // 🔸 테이블 데이터 가져오기
  const { columns, rows } = authorsTableData();

  // 🔹 날짜 문자열을 표준 형식으로 변환 (필요 시 사용 가능)
  const convertToDateStr = (shortDate) => {
    if (!shortDate) return "";
    const normalized = shortDate.replaceAll("/", "-");
    const [yy, mm, dd] = normalized.split("-");
    return `20${yy}-${mm}-${dd}`;
  };

  // 🔹 필터링된 데이터 (날짜 및 텍스트 검색 조건 반영)
  const filteredRows = rows.filter((item) => {
    const text = searchText.toLowerCase();

    // 🔸 날짜 필터 조건
    const isDateInRange =
      (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate);
    if (!isDateInRange) return false;

    // 🔸 텍스트 필터 조건
    if (filterType === "title") {
      return item.title?.toLowerCase().includes(text);
    } else if (filterType === "author") {
      return item.author?.toLowerCase().includes(text);
    } else if (filterType === "all") {
      return item.title?.toLowerCase().includes(text) || item.author?.toLowerCase().includes(text);
    }
    return true;
  });

  // 🔹 필터 드롭다운 메뉴 제어 함수
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

      {/* 📦 콘텐츠 패딩 설정 */}
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              {/* 🔍 필터 바: 검색창 + 날짜 선택 */}
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
                {/* 🔸 왼쪽: 필터 버튼 + 검색창 */}
                <MDBox display="flex" alignItems="center" gap={2} flexGrow={1}>
                  {/* 🔘 필터 타입 선택 버튼 */}
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

                  {/* 🔘 필터 선택 메뉴 */}
                  <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={() => handleMenuItemClick("title")}>제목</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("author")}>작성자</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick("all")}>제목+작성자</MenuItem>
                  </Menu>

                  {/* 🔍 검색 입력창 (고정 너비 설정) */}
                  <TextField
                    label="검색"
                    variant="outlined"
                    size="small"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    sx={{ backgroundColor: "white", borderRadius: 1, width: 300 }}
                  />
                </MDBox>

                {/* 📅 오른쪽: 날짜 필터 입력창 */}
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

              {/* 📋 데이터 테이블 출력 */}
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: filteredRows }} // 🔎 필터링된 데이터 반영
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
