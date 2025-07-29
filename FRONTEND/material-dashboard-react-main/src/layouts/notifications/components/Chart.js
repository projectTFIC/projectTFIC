// src/layouts/notifications/components/Chart.js
import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

export default function Chart({ title, data }) {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <Card>
      <MDBox px={2} pt={1}>
        <MDTypography variant="subtitle1" fontWeight="medium">
          {title}
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        <Bar data={data} options={options} />
      </MDBox>
    </Card>
  );
}

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};
