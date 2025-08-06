// src/layouts/기록관리/index.js
// (위쪽 imports는 그대로 두세요)
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TableCell from "@mui/material/TableCell";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import accessTableData from "../tables/data/accessTableData";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Menu, MenuItem } from "@mui/material";

function Tables() {
  // ─── 1) 기존 로직: 탭 데이터 불러오기 ────────────────────────
  const { columns, rows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();
  const { columns: aColumns, rows: aRows } = accessTableData();

  const tabs = [
    { label: "사고 감지", columns, rows },
    { label: "안전장비 미착용", columns: pColumns, rows: pRows },
    { label: "입출입", columns: aColumns, rows: aRows },
  ];

  // ─── 2) 추가: 클릭 토글용 상태 ───────────────────────────
  const [rowsExpanded, setRowsExpanded] = useState([]);

  // ─── 3) 기존 로직: 탭/필터/검색 상태 ─────────────────────
  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState("title");
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleChange = (_, v) => setTabIndex(v);
  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleMenuItemClick = (type) => {
    setFilterType(type);
    handleClose();
  };

  const { columns: currentColumns, rows: currentRows } = tabs[tabIndex];

  // ─── 4) 필터/검색 (생략 가능한 최소 예) ─────────────────────
  const filteredRows = currentRows.filter((r) => {
    const txt = searchText.trim().toLowerCase();
    if (!txt) return true;
    if (filterType === "title") return String(r.title.props.children).toLowerCase().includes(txt);
    if (filterType === "content")
      return String(r.content.props.children).toLowerCase().includes(txt);
    return true;
  });

  // ─── 5) 제목 클릭 시 해당 rowIndex 토글 ───────────────────
  const toggleRow = (rowIndex) => {
    setRowsExpanded((prev) =>
      prev.includes(rowIndex) ? prev.filter((i) => i !== rowIndex) : [...prev, rowIndex]
    );
  };

  // ─── 6) 제목 컬럼에만 클릭 렌더러 붙이기 ──────────────────
  const enhancedColumns = currentColumns.map((col) => {
    if (col.accessor !== "title") return col;
    return {
      ...col,
      options: {
        ...col.options,
        customBodyRender: (value, tableMeta) => (
          <MDTypography
            component="span"
            sx={{ cursor: "pointer", color: "primary.main", fontWeight: "bold" }}
            onClick={() => toggleRow(tableMeta.rowIndex)}
          >
            {value}
          </MDTypography>
        ),
      },
    };
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              {/* 탭 헤더 */}
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  <Tabs
                    value={tabIndex}
                    onChange={handleChange}
                    textColor="inherit"
                    indicatorColor="secondary"
                    sx={{
                      minWidth: 200,
                      backgroundColor: "transparent",
                      boxShadow: "none",
                      border: "none",
                    }}
                  >
                    {tabs.map((tab, idx) => (
                      <Tab key={idx} label={tab.label} />
                    ))}
                  </Tabs>
                </MDTypography>
              </MDBox>

              {/* 필터/검색 박스 */}
              <MDBox mx={2} mt={2} mb={1} display="flex" alignItems="center" gap={2}>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleClick}
                  aria-controls={open ? "filter-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  sx={{
                    fontSize: "11px",
                    color: "black !important",
                    borderColor: "gray",
                    backgroundColor: "white",
                    padding: 0,
                    width: "120px",
                  }}
                >
                  {filterType === "titleContent"
                    ? "제목+내용"
                    : filterType === "title"
                    ? "제목"
                    : filterType === "content"
                    ? "내용"
                    : filterType === "admin"
                    ? "관리자"
                    : "필터"}
                </Button>
                <Menu id="filter-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={() => handleMenuItemClick("titleContent")}>제목+내용</MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick("title")}>제목</MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick("content")}>내용</MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick("admin")}>관리자</MenuItem>
                </Menu>
                <TextField
                  label="검색"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </MDBox>

              {/* 테이블 */}
              <MDBox pt={3}>
                <DataTable
                  table={{
                    columns: enhancedColumns,
                    rows: filteredRows,
                    options: {
                      expandableRows: true, // 디테일 패널 활성화
                      expandableRowsOnClick: false, // 전체 행 클릭 무시
                      rowsExpanded: rowsExpanded, // 제어형 토글 인덱스
                      onRowsExpand: (_, allExpanded) => {
                        setRowsExpanded(allExpanded.map((r) => r.dataIndex));
                      },
                      renderExpandableRow: (rowData, rowMeta) => {
                        const content = filteredRows[rowMeta.dataIndex].content;
                        return [
                          <TableCell key="detail" colSpan={rowData.length}>
                            {content}
                          </TableCell>,
                        ];
                      },
                    },
                  }}
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

export default Tables;
