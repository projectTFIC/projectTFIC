/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Menu, MenuItem, Dialog, DialogContent } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import MDBadge from "components/MDBadge";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";

function Tables() {
  const location = useLocation();
  const pathname = location.pathname;

  const columns = [
    { Header: "No.", accessor: "listNum", align: "center" },
    { Header: "제목", accessor: "title", align: "center" },
    { Header: "유형", accessor: "type", align: "center" },
    { Header: "날짜", accessor: "date", align: "center" },
  ];

  const [acc, setAccidents] = useState([]);
  const [ppe, setPpe] = useState([]);
  const [he, setAccess] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState("title");
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    axios.get("/web/tablelist/pperecords").then((res) => {
      setPpe(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.recordTitle,
          type: (
            <MDBadge
              badgeContent={row.detectionType}
              color="warning"
              variant="gradient"
              size="lg"
            />
          ),
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

    axios.get("/web/tablelist/herecords").then((res) => {
      setAccess(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.recordTitle,
          type: (
            <MDBadge badgeContent={row.detectionType} color="info" variant="gradient" size="lg" />
          ),
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

    axios.get("/web/tablelist/accrecords").then((res) => {
      setAccidents(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.recordTitle,
          type: (
            <MDBadge badgeContent={row.detectionType} color="error" variant="gradient" size="lg" />
          ),
          originalImg: row.originalImg,
          detectImg: row.detectImg,
          content: row.content,
          location: row.location,
          date: row.regDate,
          rowId: `2-${idx}`,
          report: row.report,
        }))
      );
    });
  }, []);

  const tabs = [
    { label: "안전장비 미착용", rows: ppe },
    { label: "중장비 출입", rows: he },
    { label: "사고 감지", rows: acc },
  ];

  const handleTabChange = (_, v) => setTabIndex(v);
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

  const toggleRow = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleOpen = (src) => {
    setImageSrc(src);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setImageSrc("");
  };

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

  const DetailRow = ({ row }) => (
    <Box display="flex" flexDirection="column" gap={2} p={2}>
      <Box display="flex" gap={2}>
        {row.originalImg && (
          <Card
            sx={{ maxWidth: 400, cursor: "pointer" }}
            onClick={() => handleOpen(row.originalImg)}
          >
            <CardContent>
              <Typography variant="body2">원본 이미지</Typography>
              <img
                src={row.originalImg}
                alt="original"
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
              />
            </CardContent>
          </Card>
        )}
        {row.detectImg && (
          <Card sx={{ maxWidth: 400, cursor: "pointer" }} onClick={() => handleOpen(row.detectImg)}>
            <CardContent>
              <Typography variant="body2">감지 이미지</Typography>
              <img
                src={row.detectImg}
                alt="detected"
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
              />
            </CardContent>
          </Card>
        )}
      </Box>
      <Box display="flex" gap={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2">감지 위치</Typography>
            <Typography variant="body1">{row.location || "정보 없음"}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2">감지 일자</Typography>
            <Typography variant="body1">{row.date || "정보 없음"}</Typography>
          </CardContent>
        </Card>
      </Box>
      <Card>
        <CardContent>
          <Typography variant="body2">보고서 내용</Typography>
          <Typography variant="body1" whiteSpace="pre-line">
            {row.report || row.content || "정보 없음"}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

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
                <MDBox mx={2} mt={2} mb={1} display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={handleFilterClick}
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
                <MDBox pt={3}>
                  <DataTable
                    table={{
                      columns: enhancedColumns,
                      rows: filteredRows.flatMap((row) => {
                        const isExpanded = expandedRows.includes(row.rowId);
                        return [
                          row,
                          ...(isExpanded
                            ? [{ listNum: "", title: <DetailRow row={row} />, type: "", date: "" }]
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <img src={imageSrc} alt="확대 이미지" style={{ width: "100%", height: "auto" }} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default Tables;
