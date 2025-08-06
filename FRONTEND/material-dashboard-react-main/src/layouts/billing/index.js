/* eslint-disable react/prop-types */
import React, { useState } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import Collapse from "@mui/material/Collapse";
import { Box } from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

import useProjectsTableData from "layouts/billing/data/projectsTableData";

function TitleCell({ value, rowId, onToggle }) {
  return (
    <span
      style={{ cursor: "pointer", fontWeight: "bold", color: "black" }}
      onClick={() => onToggle(rowId)}
    >
      {value}
    </span>
  );
}
TitleCell.propTypes = {
  value: PropTypes.string.isRequired,
  rowId: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};

function Billing() {
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("title");
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);

  const { columns, rows } = useProjectsTableData(startDate, endDate);

  // 각 행에 고유 ID 부여
  const rowsWithId = rows.map((row, i) => ({
    ...row,
    rowId: `${i}`, // 필요시 날짜·타입 등 조합 가능
  }));

  const handleToggleRow = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const columnsWithToggle = columns.map((col) =>
    col.accessor === "title"
      ? {
          ...col,
          Cell: ({ value, row }) => (
            <TitleCell value={value} rowId={row.original.rowId} onToggle={handleToggleRow} />
          ),
        }
      : col
  );

  const filteredRows = rowsWithId.filter((item) => {
    const text = searchText.toLowerCase();
    const itemDate = new Date(item.originDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const isDateInRange = (!start || itemDate >= start) && (!end || itemDate <= end);
    if (!isDateInRange) return false;

    if (filterType === "title") {
      return item.title?.toLowerCase().includes(text);
    } else if (filterType === "author") {
      return item.author?.toLowerCase().includes(text);
    } else if (filterType === "all") {
      return item.title?.toLowerCase().includes(text) || item.author?.toLowerCase().includes(text);
    }
    return true;
  });

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleMenuItemClick = (type) => {
    setFilterType(type);
    handleClose();
  };

  // 토글 포함 테이블 행 구성
  const tableRowsWithContent = [];
  filteredRows.forEach((row) => {
    tableRowsWithContent.push(row);
    if (expandedRows.includes(row.rowId)) {
      tableRowsWithContent.push({
        title: (
          <TableCell colSpan={columns.length} style={{ padding: 0 }}>
            <Collapse
              in={expandedRows.includes(row.rowId)}
              timeout={300}
              style={{ backgroundColor: "#f9f9f9", borderTop: "1px solid #eee" }}
            >
              <Box p={2}>
                <MDTypography variant="body2" color="text">
                  {row.content || `${row.title} 보고서 내용이 없습니다.`}
                </MDTypography>
                {row.image && (
                  <img
                    src={row.image}
                    alt="보고서 이미지"
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
        isExpandedContent: true,
      });
    }
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              {/* 필터 */}
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
                  table={{
                    columns: columnsWithToggle,
                    rows: tableRowsWithContent,
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

export default Billing;
