/* eslint-disable react/prop-types */
import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import DetailRow from "./DetailRow";

export default function heRecordTableData(
  records = [],
  expandedRowId,
  setExpandedRowId,
  tabIndex = 0
) {
  const handleRowClick = (recordId) => {
    setExpandedRowId(expandedRowId === recordId ? null : recordId);
  };

  const validRecords = Array.isArray(records) ? records : [];

  return {
    columns: [
      { Header: "번호", accessor: "recordId", align: "center", width: "5%" },
      { Header: "제목", accessor: "recordTitle", align: "left" },
      { Header: "탐지유형", accessor: "detectionType", align: "center" },
      { Header: "날짜", accessor: "regDate", align: "center" },
    ],
    rows: validRecords.flatMap((record) => {
      const isExpanded = expandedRowId === record.recordId;

      return [
        {
          recordId: (
            <MDTypography
              component="div"
              variant="caption"
              color="text"
              fontWeight="medium"
              sx={{ cursor: "pointer" }}
              onClick={() => handleRowClick(record.recordId)}
            >
              {record.recordId}
            </MDTypography>
          ),
          recordTitle: (
            <MDTypography
              component="div"
              variant="caption"
              color="text"
              fontWeight="medium"
              sx={{ cursor: "pointer" }}
              onClick={() => handleRowClick(record.recordId)}
            >
              {record.recordTitle}
            </MDTypography>
          ),
          detectionType: (
            <MDBox ml={-1}>
              <MDBadge
                badgeContent={record.detectionType}
                color="info"
                variant="gradient"
                size="sm"
              />
            </MDBox>
          ),
          regDate: (
            <MDTypography component="div" variant="caption" color="text" fontWeight="medium">
              {record.regDate}
            </MDTypography>
          ),
        },
        ...(isExpanded
          ? [
              {
                recordId: {
                  props: { colSpan: 4 },
                  children: <DetailRow row={record} tabIndex={tabIndex} enableZoom={true} />,
                },
                recordTitle: null,
                detectionType: null,
                regDate: null,
              },
            ]
          : []),
      ];
    }),
  };
}
