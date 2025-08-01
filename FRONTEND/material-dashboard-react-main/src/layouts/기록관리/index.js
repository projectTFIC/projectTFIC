// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";

import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Menu, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

function Tables() {
  const location = useLocation(); // ✅ 이 줄 추가
  const pathname = location.pathname; // ✅ 이 줄 추가
  const { columns, rows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();
  const tabs = [
    { label: "사고 감지", columns, rows },
    { label: "안전장비 미착용", columns: pColumns, rows: pRows },
    { label: "입출입", columns, rows },
  ];

  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState("title");
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (type) => {
    setFilterType(type);
    handleClose();
  };

  const open = Boolean(anchorEl);

  const { label, columns: currentColumns, rows: currentRows } = tabs[tabIndex];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <motion.div
        key={pathname}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
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
                      {tabs.map((tab, index) => (
                        <Tab key={index} label={tab.label} />
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
                    table={{ columns: currentColumns, rows: currentRows }}
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
      </motion.div>
    </DashboardLayout>
  );
}

export default Tables;
