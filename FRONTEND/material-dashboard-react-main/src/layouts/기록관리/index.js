/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import MDBadge from "components/MDBadge";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import DetailRow from "layouts/기록관리/components/DetailRow";

function LogManagement() {
  const { pathname } = useLocation();

  const [accidents, setAccidents] = useState([]);
  const [ppe, setPpe] = useState([]);
  const [access, setAccess] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState("title");
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // 모달 확대 기능
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [showFullText, setShowFullText] = useState({});

  const openMenu = Boolean(anchorEl);

  const badgeByType = (type) => {
    const color = type === "acc" ? "error" : type === "ppe" ? "warning" : "info";
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

  const handleTabChange = (_, v) => setTabIndex(v);
  const handleFilterClick = (e) => setAnchorEl(e.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const handleFilterSelect = (t) => {
    setFilterType(t);
    handleFilterClose();
  };

  const toggleRow = (rowId) => setExpandedRow((prev) => (prev === rowId ? null : rowId));

  const handleOpen = (src) => {
    setImageSrc(src);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleWheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY;
    setScale((prev) => {
      let next = prev - delta * 0.001;
      return Math.min(Math.max(next, 0.5), 5);
    });
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

  const columns = [
    { Header: "No.", accessor: "listNum", align: "center" },
    {
      Header: "제목",
      accessor: "title",
      align: "center",
      Cell: ({ value, row }) => (
        <MDTypography
          component="span"
          sx={{ cursor: "pointer", color: "#111213ff", fontWeight: "bold" }}
          onClick={() => toggleRow(row.original.rowId)}
        >
          {value}
        </MDTypography>
      ),
    },
    { Header: "유형", accessor: "type", align: "center" },
    { Header: "날짜", accessor: "date", align: "center" },
  ];

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
                <MDBox pt={3}>
                  <DataTable
                    table={{
                      columns,
                      rows: filteredRows.flatMap((row) => {
                        const isExpanded = expandedRow === row.rowId;
                        return [
                          row,
                          ...(isExpanded
                            ? [
                                {
                                  listNum: "",
                                  title: (
                                    <motion.div
                                      key={`detail-${row.rowId}`} // key가 자꾸 바뀌면 무한 렌더링
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <DetailRow
                                        row={row}
                                        showFullText={showFullText}
                                        setShowFullText={setShowFullText}
                                        handleOpen={handleOpen}
                                      />
                                    </motion.div>
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
        {/* <Footer /> */}
      </DashboardLayout>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent
          onWheel={handleWheelZoom}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setTranslate({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y,
            });
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
