import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Menu, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

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

  // 탭별 데이터 상태
  const [accidents, setAccidents] = useState([]);
  const [ppe, setPpe] = useState([]);
  const [access, setAccess] = useState([]);
  // 탭, 필터, 검색 상태
  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState("title");
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  // API에서 데이터 fetch
  useEffect(() => {
    axios.get("/web/tablelist/accidents").then((res) => {
      setAccidents(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.title,
          type: <MDBadge badgeContent="사고감지" color="error" variant="gradient" size="lg" />,
          date: row.date,
        }))
      );
    });

    axios.get("/web/tablelist/equipment").then((res) => {
      setPpe(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.title,
          type: <MDBadge badgeContent="안전장비" color="warning" variant="gradient" size="lg" />,
          date: row.date,
        }))
      );
    });

    axios.get("/web/tablelist/access").then((res) => {
      setAccess(
        res.data.map((row, idx) => ({
          listNum: idx + 1,
          title: row.title,
          type: <MDBadge badgeContent="입출입" color="info" variant="gradient" size="lg" />,
          date: row.date,
        }))
      );
    });
  }, []);

  const tabs = [
    { label: "사고 감지", rows: accidents },
    { label: "안전장비 미착용", rows: ppe },
    { label: "입출입", rows: access },
  ];

  // 탭 이벤트 핸들러
  const handleChange = (event, newValue) => setTabIndex(newValue);
  const handleClose = () => setAnchorEl(null);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuItemClick = (type) => {
    setFilterType(type);
    handleClose();
  };
  const open = Boolean(anchorEl);

  // 검색 필터 적용 (제목 기준)
  const filteredRows = searchText
    ? tabs[tabIndex].rows.filter((row) => String(row.title).includes(searchText))
    : tabs[tabIndex].rows;

  const { rows: currentRows } = tabs[tabIndex];

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
                      onChange={handleChange}
                      textColor="inherit"
                      indicatorColor="secondary"
                      aria-label="tables tabs"
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
                      padding: "0px",
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
                  <Menu
                    id="filter-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "filter-button",
                    }}
                  >
                    <MenuItem onClick={() => handleMenuItemClick("titleContent")}>
                      제목+내용
                    </MenuItem>
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
                <MDBox pt={3}>
                  <DataTable
                    table={{ columns, rows: filteredRows }}
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
