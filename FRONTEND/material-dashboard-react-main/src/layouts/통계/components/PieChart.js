import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { colorOf } from "./Chart";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ title, labels = [], values = [] }) {
  const chartData = useMemo(() => {
    const colors = labels.map((lbl) => colorOf(lbl));
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: colors.map((c) => c),
          borderWidth: 2,
        },
      ],
    };
  }, [labels, values]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#0b0d0fff", // 다크 배경 가독성
            boxWidth: 12,
            font: { size: 13 },
          },
        },
        tooltip: {
          titleColor: "#0B1020",
          bodyColor: "#0B1020",
          backgroundColor: "#E8EEF8",
          borderColor: "#CFD8E3",
          borderWidth: 1,
        },
      },
    }),
    []
  );

  return (
    <Card sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <MDBox px={2} pt={1}>
        <MDTypography variant="subtitle1" fontWeight="medium" sx={{ color: "#040505ff" }}>
          {title}
        </MDTypography>
      </MDBox>
      <MDBox sx={{ flex: 1, p: 2, position: "relative" }}>
        <Pie data={chartData} options={options} />
      </MDBox>
    </Card>
  );
}

PieChart.propTypes = {
  title: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string),
  values: PropTypes.arrayOf(PropTypes.number),
};
