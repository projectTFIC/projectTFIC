/* eslint-disable react/prop-types */
// src/layouts/기록관리/index.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import TableCell from "@mui/material/TableCell";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Menu, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

function Tables() {
  const location = useLocation();
  const pathname = location.pathname;

  // 고정 컬럼 정의
  const columns = [
    { Header: "No.", accessor: "listNum", align: "center" },
    { Header: "제목", accessor: "title", align: "center" },
    { Header: "유형", accessor: "type", align: "center" },
    { Header: "날짜", accessor: "date", align: "center" },
  ];

  // 데이터 상태
  const [acc, setAccidents] = useState([]);
  const [ppe, setPpe] = useState([]);
  const [he, setAccess] = useState([]);

  // UI 상태
  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState("title");
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]); // rowId 기반 토글

  const openMenu = Boolean(anchorEl);

  // 데이터 로드
  useEffect(() => {
    // [Back] 안전장비 미착용
    axios.get("/web/tablelist/pperecords").then((res) => {
      setPpe(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.recordTitle, // 게시글 제목
          type: (
            <MDBadge
              badgeContent={row.detectionType}
              color="warning"
              variant="gradient"
              size="lg"
            />
          ), // 탐지유형
          originalImg: row.originalImg, // 원본 이미지
          detectImg: row.detectImg, // 감지 이미지
          content: row.content, // 보고문
          helmetOff: row.helmetOff, // 안전모 미착용
          hookOff: row.hookOff, // 안전모 미착용
          beltOff: row.beltOff, // 안전모 미착용
          shoesOff: row.shoesOff, // 안전모 미착용
          deviceId: row.deviceId, // 장치 아이디
          location: row.location, // 설치 위치
          date: row.regDate, // 탐지 날짜
        }))
      );
    });

    // [Back] 중장비 출입
    axios.get("/web/tablelist/herecords").then((res) => {
      setAccess(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.recordTitle, // 게시글 제목
          type: (
            <MDBadge badgeContent={row.detectionType} color="info" variant="gradient" size="lg" />
          ), // 탐지 유형
          originalImg: row.originalImg, // 원본 이미지
          detectImg: row.detectImg, // 감지 이미지
          heType: row.hetype, // 중장비 유형
          heNumber: row.heNumber, // 번호판
          access: row.access, // 입출입
          deviceId: row.deviceId, // 장치 아이디
          location: row.location, // 설치 위치
          date: row.regDate, // 탐지 날짜
        }))
      );
    });

    // [Back] 사고 감지
    axios.get("/web/tablelist/accrecords").then((res) => {
      setAccidents(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.recordTitle, // 게시글 제목
          type: (
            <MDBadge badgeContent={row.detectionType} color="error" variant="gradient" size="lg" />
          ), // 탐지 유형
          originalImg: row.originalImg, // 원본 이미지
          detectImg: row.detectImg, // 감지 이미지
          content: row.content, // 세부정보
          deviceId: row.deviceId, // 장치 아이디
          location: row.location, // 설치 위치
          date: row.regDate, // 탐지 날짜
        }))
      );
    });
  }, []);

  // 탭 데이터
  const tabs = [
    { label: "안전장비 미착용", rows: ppe },
    { label: "중장비 출입", rows: he },
    { label: "사고 감지", rows: acc },
  ];

  // 필터 핸들러
  const handleTabChange = (_, v) => setTabIndex(v);
  const handleFilterClick = (e) => setAnchorEl(e.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const handleFilterSelect = (t) => {
    setFilterType(t);
    handleFilterClose();
  };

  // 검색 필터링
  const filteredRows = tabs[tabIndex].rows.filter((r) => {
    const txt = searchText.trim().toLowerCase();
    if (!txt) return true;

    const title = String(r.title || "").toLowerCase();
    const content = String(r.content || "").toLowerCase();

    if (filterType === "title") return title.includes(txt);
    if (filterType === "content") return content.includes(txt);
    if (filterType === "titleContent") return title.includes(txt) || content.includes(txt);
    return true;
  });

  // 각 행에 rowId 부여
  const rowsWithId = filteredRows.map((r, i) => ({
    ...r,
    rowId: `${tabIndex}-${i}`,
  }));

  // 토글
  const toggleRow = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  // 제목 클릭 가능하도록 컬럼 수정
  const enhancedColumns = columns.map((col) => {
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

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                {/* 탭 */}
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
                    <MenuItem onClick={() => handleFilterSelect("titleContent")}>
                      제목+내용
                    </MenuItem>
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
                                    <TableCell colSpan={columns.length} style={{ padding: 0 }}>
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
                                            {`감지위치 :  ${row.location || "정보 없음"}`}
                                          </MDTypography>
                                          {row.originalImg && (
                                            <img
                                              src={row.originalImg}
                                              alt="게시글 이미지"
                                              style={{
                                                maxWidth: "800px",
                                                maxHeight: "500px",
                                                width: "100%",
                                                height: "auto",
                                                borderRadius: 6,
                                                marginTop: 4,
                                                objectFit: "contain",
                                              }}
                                            />
                                          )}
                                          {row.detectImg && (
                                            <Box mt={2}>
                                              {row.detectImg.startsWith("http") ||
                                              row.detectImg.startsWith("data:") ? (
                                                <img
                                                  src={row.detectImg}
                                                  alt="detectImg"
                                                  style={{
                                                    maxWidth: "800px",
                                                    maxHeight: "500px",
                                                    width: "100%",
                                                    height: "auto",
                                                    borderRadius: 6,
                                                    marginTop: 4,
                                                    objectFit: "contain",
                                                  }}
                                                />
                                              ) : (
                                                <MDTypography variant="caption" color="info">
                                                  {row.detectImg}
                                                </MDTypography>
                                              )}
                                              {tabIndex === 1 ? (
                                                <MDTypography variant="body2" color="text">
                                                  {`차량번호 :  ${row.heNumber || "정보 없음"}`}
                                                </MDTypography>
                                              ) : null}
                                            </Box>
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
    </motion.div>
  );
}

export default Tables;
