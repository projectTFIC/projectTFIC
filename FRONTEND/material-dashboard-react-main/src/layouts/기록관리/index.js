/* eslint-disable react/prop-types */
// src/layouts/기록관리/index.js

import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TableCell from "@mui/material/TableCell";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import accessTableData from "layouts/tables/data/accessTableData";

export default function Tables() {
  const authorsData =
    typeof authorsTableData === "function" ? authorsTableData() : authorsTableData;
  const projectsData =
    typeof projectsTableData === "function" ? projectsTableData() : projectsTableData;
  const accessData = typeof accessTableData === "function" ? accessTableData() : accessTableData;

  const tabs = [
    { label: "사고 감지", columns: authorsData.columns || [], rows: authorsData.rows || [] },
    {
      label: "안전장비 미착용",
      columns: projectsData.columns || [],
      rows: projectsData.rows || [],
    },
    { label: "입출입", columns: accessData.columns || [], rows: accessData.rows || [] },
  ];

  // 상태
  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState("title");
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]); // rowId 기반 관리

  const openMenu = Boolean(anchorEl);

  const handleTabChange = (_, v) => setTabIndex(v);
  const handleFilterClick = (e) => setAnchorEl(e.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const handleFilterSelect = (t) => {
    setFilterType(t);
    handleFilterClose();
  };

  const currentColumns = tabs[tabIndex].columns;
  const currentRows = tabs[tabIndex].rows;

  // 검색 필터링
  const filteredRows = currentRows.filter((r) => {
    const txt = searchText.trim().toLowerCase();
    if (!txt) return true;
    const title = String(r.title?.props?.children || r.title).toLowerCase();
    const content = String(r.content?.props?.children || r.content || "").toLowerCase();
    if (filterType === "title") return title.includes(txt);
    if (filterType === "content") return content.includes(txt);
    if (filterType === "titleContent") return title.includes(txt) || content.includes(txt);
    return true;
  });

  // 토글
  const toggleRow = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  // 제목 클릭 시 rowId 전달
  const enhancedColumns = currentColumns.map((col) => {
    if (col.accessor !== "title") return col;
    return {
      ...col,
      Cell: ({ value, row }) => {
        const rowId = row.original.rowId;
        return (
          <MDTypography
            component="span"
            sx={{ cursor: "pointer", color: "black", fontWeight: "bold" }}
            onClick={() => toggleRow(rowId)}
          >
            {value}
          </MDTypography>
        );
      },
    };
  });

  // 각 행에 rowId 부여
  const rowsWithId = filteredRows.map((r, i) => ({
    ...r,
    rowId: `${tabIndex}-${i}`, // ← 여기 문법 오류 수정
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              {/* 탭 영역 */}
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
                    onChange={handleTabChange}
                    textColor="inherit"
                    indicatorColor="secondary"
                  >
                    {tabs.map((t, i) => (
                      <Tab key={i} label={t.label} />
                    ))}
                  </Tabs>
                </MDTypography>
              </MDBox>

              {/* 필터 + 검색 */}
              <MDBox mx={2} mt={2} mb={1} display="flex" alignItems="center" gap={2}>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleFilterClick}
                  aria-controls={openMenu ? "filter-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={openMenu ? "true" : undefined}
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
                    : "필터"}
                </Button>
                <Menu
                  id="filter-menu"
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleFilterClose}
                >
                  <MenuItem onClick={() => handleFilterSelect("titleContent")}>제목+내용</MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("title")}>제목</MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("content")}>내용</MenuItem>
                </Menu>
                <TextField
                  label="검색"
                  size="small"
                  fullWidth
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
              </MDBox>

              {/* DataTable */}
              <MDBox pt={3}>
                <DataTable
                  table={{
                    columns: enhancedColumns,
                    rows: rowsWithId.flatMap((row) => {
                      const isExpanded = expandedRows.includes(row.rowId);
                      return [
                        row,
                        ...(isExpanded
                          ? [
                              {
                                listNum: "",
                                title: (
                                  <TableCell colSpan={currentColumns.length} style={{ padding: 0 }}>
                                    <Collapse
                                      in={isExpanded}
                                      timeout={300}
                                      style={{
                                        backgroundColor: "#f9f9f9",
                                        borderTop: "1px solid #eee",
                                      }}
                                    >
                                      <Box p={2}>
                                        <MDTypography variant="body2" color="text">
                                          {row.content || "내용 없음"}
                                        </MDTypography>
                                        {row.image && (
                                          <img
                                            src={row.image}
                                            alt="게시글 이미지"
                                            style={{
                                              maxWidth: "100%",
                                              marginTop: "10px",
                                              borderRadius: "8px",
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </Collapse>
                                  </TableCell>
                                ),
                                type: "",
                                date: "",
                              },
                            ]
                          : []),
                      ];
                    }),
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
