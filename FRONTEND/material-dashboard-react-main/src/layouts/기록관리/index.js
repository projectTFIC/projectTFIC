/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Grid,
  Tabs,
  Tab,
  TextField,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
} from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import MDBadge from "components/MDBadge";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import DetailRow from "layouts/기록관리/components/DetailRow";
import Collapse from "@mui/material/Collapse";

function LogManagement() {
  const { pathname } = useLocation();

  // 탭 데이터
  const [accidents, setAccidents] = useState([]);
  const [ppe, setPpe] = useState([]);
  const [access, setAccess] = useState([]);

  // UI 상태
  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState("title");
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // 행 아래 토글(한 번에 하나만)
  const [expandedRowId, setExpandedRowId] = useState(null);

  // 이미지 확대 모달(줌/팬)
  const [zoomOpen, setZoomOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const badgeByType = (type) => {
    const color = type === "acc" ? "error" : type === "ppe" ? "warning" : "success";
    const label = type === "acc" ? "사고" : type === "ppe" ? "미착용" : "입출입";
    return <MDBadge badgeContent={label} color={color} variant="gradient" size="lg" />;
  };

  useEffect(() => {
    axios.get("/web/tablelist/accidents").then((res) => {
      setAccidents(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.recordTitle,
          type: badgeByType("acc"),
          originalImg: row.originalImg,
          detectImg: row.detectImg,
          content: row.content,
          location: row.location,
          date: row.regDate,
          rowId: `0-${idx}`,
          report: row.report,
        }))
      );
    });

    axios.get("/web/tablelist/equipments").then((res) => {
      setPpe(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.recordTitle,
          type: badgeByType("ppe"),
          originalImg: row.originalImg,
          detectImg: row.detectImg,
          content: row.content,
          location: row.location,
          date: row.regDate,
          rowId: `1-${idx}`,
          report: row.report,
        }))
      );
    });

    axios.get("/web/tablelist/access").then((res) => {
      setAccess(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.recordTitle,
          type: badgeByType("he"),
          originalImg: row.originalImg,
          detectImg: row.detectImg,
          location: row.location,
          date: row.regDate,
          rowId: `2-${idx}`,
          report: row.report,
          heNumber: row.heNumber,
        }))
      );
    });
  }, []);

  const tabs = [
    { label: "사고 감지", rows: accidents },
    { label: "안전장비 미착용 감지", rows: ppe },
    { label: "입출입 감지", rows: access },
  ];

  // 필터/검색
  const handleTabChange = (_, v) => {
    setTabIndex(v);
    setExpandedRowId(null); // 탭 전환 시 접기
  };
  const handleFilterClick = (e) => setAnchorEl(e.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const handleFilterSelect = (t) => {
    setFilterType(t);
    handleFilterClose();
  };

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

  // 이미지 줌 핸들러
  const openZoom = (src) => {
    setImageSrc(src);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setZoomOpen(true);
  };
  const onWheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY;
    setScale((prev) => Math.min(Math.max(prev - delta * 0.001, 0.5), 5));
  };

  // DataTable 컬럼
  const columns = [
    { Header: "No.", accessor: "listNum", align: "center" },

    {
      Header: "제목",
      accessor: "title",
      align: "center",
      Cell: ({ value, row }) => {
        const id = row.original.rowId;
        const isOpen = expandedRowId === id;
        return (
          <MDTypography
            component="span"
            sx={{
              cursor: "pointer",
              color: isOpen ? "#1976d2" : "#111213ff",
              fontWeight: "bold",
            }}
            onClick={() => setExpandedRowId(isOpen ? null : id)}
          >
            {value}
          </MDTypography>
        );
      },
    },

    { Header: "유형", accessor: "type", align: "center" },
    { Header: "날짜", accessor: "date", align: "center" },
  ];

  // 행 아래 토글: detail 행에 클릭 전파 방지
  const rowsWithDetail = filteredRows.flatMap((r) => {
    const isOpen = expandedRowId === r.rowId;
    return [
      r,
      ...(isOpen
        ? [
            {
              listNum: "",
              title: (
                <div
                  style={{ padding: "8px 0" }}
                  onClick={(e) => e.stopPropagation()} // 🔒 행 토글로 전파 방지
                  onMouseDown={(e) => e.stopPropagation()} // 🔒 일부 구현 보호
                >
                  <DetailRow row={r} onOpenImage={openZoom} />
                </div>
              ),
              type: "",
              date: "",
              rowId: `${r.rowId}-detail`,
            },
          ]
        : []),
    ];
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
        {/* 페이지 스크롤 보장 */}
        <MDBox pt={6} pb={3} sx={{ overflowY: "auto" }}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                {/* 탭 */}
                <MDBox
                  mx={2}
                  mt={-3}
                  py={0}
                  px={0}
                  variant="gradient"
                  bgColor="info"
                  borderRadius="lg"
                  coloredShadow="info"
                >
                  <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    textColor="inherit"
                    indicatorColor="secondary"
                  >
                    {tabs.map((t, i) => (
                      <Tab
                        key={i}
                        label={t.label}
                        sx={{
                          color: "white",
                          fontSize: "1.2rem",
                          fontWeight: 600,
                          textTransform: "none",
                        }}
                      />
                    ))}
                  </Tabs>
                </MDBox>

                {/* 검색/필터 */}
                <MDBox mx={2} mt={2} mb={1} display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={handleFilterClick}
                    sx={{ minWidth: "100px", fontSize: "13px", color: "black !important" }}
                  >
                    {filterType === "titleContent"
                      ? "제목+내용"
                      : filterType === "title"
                      ? "제목"
                      : "내용"}
                  </Button>
                  <Menu anchorEl={anchorEl} open={openMenu} onClose={handleFilterClose}>
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
                  />
                </MDBox>

                {/* DataTable: 행 아래 토글 포함 */}
                <MDBox pt={3}>
                  <DataTable
                    table={{ columns, rows: rowsWithDetail }}
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
      </DashboardLayout>

      {/* 이미지 확대 모달 */}
      <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} maxWidth="md" fullWidth>
        <DialogContent
          onWheel={(e) => {
            onWheelZoom(e);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          sx={{
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <img
            src={imageSrc}
            alt="확대 이미지"
            style={{
              transform: `scale(${scale}) translate(${translate.x / scale}px, ${
                translate.y / scale
              }px)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
              maxWidth: "100%",
              maxHeight: "100%",
              pointerEvents: "none",
              userSelect: "none",
            }}
            draggable={false}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default LogManagement;
