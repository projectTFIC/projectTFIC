// src/layouts/보고서/index.js
import React, { useState } from "react";
import PropTypes from "prop-types";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import { styled } from "@mui/material/styles";

// Date picker
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// Template components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import DataTable from "examples/Tables/DataTable";

// 데이터 훅 (API 연동)
import useProjectsTableData from "layouts/보고서/data/projectsTableData";

// ========== 스타일 정의 ===========
const FilterPanel = styled(Card)(({ theme }) => ({
  position: "relative", // 반드시 있어야 함
  borderRadius: 16,
  padding: theme.spacing(3),
  background: "linear-gradient(180deg, rgba(17,24,39,1), rgba(17,24,39,0.7))",
  border: `1px solid rgba(255, 255, 255, 0.16)`,
  boxShadow: "0 12px 36px rgba(2,8,23,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  color: "#fff",
  maxWidth: "none",
  overflow: "hidden",

  "&::before": {
    content: '""',
    position: "absolute",
    top: "-20%", // 위쪽 위치를 더 위로 올림
    left: "-50%",
    width: "200%",
    height: "200%",
    background: "radial-gradient(ellipse at top, rgba(64, 224, 208, 0.4) 0%, transparent 60%)", // 위쪽에 타원형 그라데이션으로 투명해짐
    animation: "pulseMint 4s ease-in-out infinite",
    zIndex: 0,
  },

  "& > *": {
    position: "relative",
    zIndex: 1,
  },

  "@keyframes pulseMint": {
    "0%, 100%": {
      transform: "scale(0.9)",
      opacity: 0.6,
    },
    "50%": {
      transform: "scale(1.2)",
      opacity: 0.3,
    },
  },
}));

const TablePanel = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  background: "#fff",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  marginTop: theme.spacing(4),
}));

const FilterButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 12,
  padding: "8px 16px",
  color: "#fff",
  borderColor: "rgba(255,255,255,0.6)",
  "&:hover": {
    borderColor: "#90caf9",
    backgroundColor: "rgba(144,202,249,0.15)",
  },
}));

const FieldCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(1),
  borderRadius: 12,
  border: `1px solid rgba(255,255,255,0.3)`,
  minWidth: 160,
}));

// ========== TitleCell 컴포넌트 (테이블 내 타이틀 링크) ===========
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
        backgroundColor: "#f9f9f9",
        borderRadius: "6px",
        padding: "4px 8px",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: "#f1f5ff",
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
          fontSize: "1.25rem",
          fontWeight: 700,
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

// ========== 메인 컴포넌트 ===========
export default function Billing() {
  // 상태 관리
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("title");
  const [anchorEl, setAnchorEl] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // API 훅
  const { columns, rows } = useProjectsTableData(startDate, endDate);

  // 타이틀 컬럼에 링크 렌더링 함수 적용
  const columnsWithDownload = columns.map((col) =>
    col.accessor === "title" ? { ...col, Cell: TitleCell } : col
  );

  // 검색 필터 적용
  const filteredRows = rows.filter((item) => {
    const text = (searchText || "").toLowerCase();

    // 날짜 필터링
    const itemDate = new Date(item.originDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const inRange = (!start || itemDate >= start) && (!end || itemDate <= end);
    if (!inRange) return false;

    // 텍스트 필터링
    const titleMatch = (item.title || "").toLowerCase().includes(text);
    const authorMatch = (item.author || "").toLowerCase().includes(text);

    if (filterType === "title") return titleMatch;
    if (filterType === "author") return authorMatch;
    if (filterType === "all") return titleMatch || authorMatch;

    return true;
  });

  // 메뉴 열고 닫기
  const open = Boolean(anchorEl);
  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleMenuItemClick = (type) => {
    setFilterType(type);
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DashboardLayout>
        <DashboardNavbar />

        <MDBox pt={6} pb={5} px={3} sx={{ minHeight: "100vh" }}>
          <Grid container spacing={3} justifyContent="center">
            {/* 검색 필터 박스 */}
            <Grid item xs={12} md={12}>
              <FilterPanel sx={{ width: "100%" }}>
                <Box
                  display="flex"
                  flexWrap="wrap"
                  gap={2}
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  {/* 필터 버튼 + 검색창 */}
                  <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" flexGrow={1}>
                    <FilterButton onClick={handleClick}>
                      {filterType === "title"
                        ? "제목"
                        : filterType === "author"
                        ? "작성자"
                        : "제목+작성자"}
                    </FilterButton>

                    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                      <MenuItem onClick={() => handleMenuItemClick("title")}>제목</MenuItem>
                      <MenuItem onClick={() => handleMenuItemClick("author")}>작성자</MenuItem>
                      <MenuItem onClick={() => handleMenuItemClick("all")}>제목+작성자</MenuItem>
                    </Menu>

                    <TextField
                      label="검색어 입력"
                      variant="outlined"
                      size="small"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.15)",
                        borderRadius: 3,
                        input: { color: "#fff" },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.5)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.8)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#90caf9",
                          },
                        },
                        "& label": {
                          color: "rgba(255,255,255,0.7)",
                        },
                        "& label.Mui-focused": {
                          color: "#90caf9",
                        },
                        width: 300,
                      }}
                    />
                  </Box>

                  {/* 날짜 선택 필터 */}
                  <Box
                    display="flex"
                    gap={2}
                    flexWrap="wrap"
                    alignItems="center"
                    mt={{ xs: 2, md: 0 }}
                  >
                    <FieldCard>
                      <Box sx={{ color: "#fff", fontWeight: 700, mb: 0.5 }}>시작일</Box>
                      <DatePicker
                        value={startDate}
                        onChange={(newVal) => setStartDate(newVal)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            sx={{
                              minWidth: 150,
                              input: { color: "#fff" },
                              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                              "& .MuiSvgIcon-root": { color: "#fff" },
                            }}
                          />
                        )}
                      />
                    </FieldCard>

                    <FieldCard>
                      <Box sx={{ color: "#fff", fontWeight: 700, mb: 0.5 }}>종료일</Box>
                      <DatePicker
                        value={endDate}
                        onChange={(newVal) => setEndDate(newVal)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            sx={{
                              minWidth: 150,
                              input: { color: "#fff" },
                              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                              "& .MuiSvgIcon-root": { color: "#fff" },
                            }}
                          />
                        )}
                      />
                    </FieldCard>
                  </Box>
                </Box>
              </FilterPanel>
            </Grid>

            {/* 테이블 박스 */}
            <Grid item xs={12} md={11}>
              <TablePanel>
                <MDBox
                  pt={3}
                  sx={{
                    "& table": {
                      borderCollapse: "separate",
                      borderSpacing: "0 14px",
                      width: "100%",
                    },
                    "& thead th": {
                      backgroundColor: "rgba(25, 118, 210, 0.95)",
                      color: "#fff !important",
                      fontWeight: "700",
                      fontSize: "1.1rem",
                      WebkitTextFillColor: "#fff !important",
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      padding: "18px 12px",
                      userSelect: "none",
                      textAlign: "center !important",
                    },
                    "& tbody tr": {
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      cursor: "pointer",
                      boxShadow: "none",
                    },
                    "& tbody tr:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 8px 25px rgba(25, 118, 210, 0.3)",
                      backgroundColor: "rgba(25, 118, 210, 0.15)",
                    },
                    "& tbody td": {
                      padding: "16px 12px",
                      verticalAlign: "middle",
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#222",
                    },
                  }}
                >
                  <DataTable
                    table={{ columns: columnsWithDownload, rows: filteredRows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                </MDBox>
              </TablePanel>
            </Grid>
          </Grid>
        </MDBox>
      </DashboardLayout>
    </LocalizationProvider>
  );
}
