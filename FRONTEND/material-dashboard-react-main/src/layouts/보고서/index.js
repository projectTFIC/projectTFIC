import React, { useState } from "react";
import PropTypes from "prop-types";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

// Template components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import DataTable from "examples/Tables/DataTable";

// 데이터 훅 (API 연동)
import useProjectsTableData from "layouts/보고서/data/projectsTableData";

// === 제목 컬럼 셀: 문서 아이콘 + 제목(호버 강조) + 다운로드 아이콘 ===
function TitleCell({ row }) {
  const url = row.original.reportFile;
  const title = row.original.title;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        minWidth: 0,
        backgroundColor: "#f9f9f9", // 연한 배경
        borderRadius: "6px",
        padding: "4px 8px",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: "#f1f5ff", // 호버 시 살짝 파란 배경
        },
      }}
    >
      <DescriptionOutlinedIcon fontSize="small" color="primary" />

      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download
        underline="hover"
        color="text.primary"
        sx={{
          fontSize: "1.25rem", // 제목 크기
          fontWeight: 700, // 제목 굵기
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 520,
          "&:hover": { color: "primary.main" },
        }}
      >
        {title}
      </Link>
    </Stack>
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
  // 검색/필터 상태
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("title");
  const [anchorEl, setAnchorEl] = useState(null);

  // 날짜 필터
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 데이터 불러오기 (필요 시 날짜 전달)
  const { columns, rows } = useProjectsTableData(startDate, endDate);

  // 제목 컬럼만 커스텀 셀로 교체
  const columnsWithDownload = columns.map((col) =>
    col.accessor === "title" ? { ...col, Cell: TitleCell } : col
  );

  // 필터링(Prettier가 싫어하는 긴 한 줄 OR 조건을 변수로 분리)
  const filteredRows = rows.filter((item) => {
    const text = (searchText || "").toLowerCase();

    // 날짜 비교: originDate가 ISO 문자열이라고 가정
    const itemDate = new Date(item.originDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const inRange = (!start || itemDate >= start) && (!end || itemDate <= end);
    if (!inRange) return false;

    const titleMatch = (item.title || "").toLowerCase().includes(text);
    const authorMatch = (item.author || "").toLowerCase().includes(text);

    if (filterType === "title") return titleMatch;
    if (filterType === "author") return authorMatch;
    if (filterType === "all") return titleMatch || authorMatch;

    return true;
  });

  // 필터 메뉴
  const open = Boolean(anchorEl);
  const handleClick = (e) => setAnchorEl(e.currentTarget);
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
                {/* 왼쪽: 필터 버튼 + 검색 */}
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

              {/* 테이블 */}
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

      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default Billing;
