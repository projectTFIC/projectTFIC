// File: src/layouts/notifications/components/PieChart.js

import React from "react";
import PropTypes from "prop-types";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ title, data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { boxWidth: 12, font: { size: 14 } },
      },
      title: { display: false },
    },
  };

  return (
    <Card sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <MDBox px={2} pt={1}>
        <MDTypography variant="subtitle1" fontWeight="medium">
          {title}
        </MDTypography>
      </MDBox>
      <MDBox sx={{ flex: 1, p: 2, position: "relative" }}>
        <Pie data={data} options={options} />
      </MDBox>
    </Card>
  );
}

PieChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};
