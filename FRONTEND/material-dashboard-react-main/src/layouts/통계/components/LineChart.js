import React from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LineChart({ data, options }) {
  return <Line data={data} options={options} />;
}

LineChart.propTypes = {
  data: PropTypes.object.isRequired,
  options: PropTypes.object,
};

// ===== 예시 데이터 생성 =====
// props로 data를 넘길 때 이런 형태로 생성해서 전달하면 됩니다.
export const createHeavyEquipmentData = (statsData, startDate, endDate) => {
  // 날짜 범위 필터
  const isWithinRange = (dateStr, start, end) => {
    if (!dateStr) return false;
    const onlyDate = dateStr.split(" ")[0].replace(/\./g, "-").replace(/\//g, "-");
    const date = new Date(onlyDate);
    return date >= new Date(start) && date <= new Date(end);
  };

  const filtered = (statsData.dayStats || []).filter((d) =>
    isWithinRange(d.date, startDate, endDate)
  );

  const labels = filtered.map((d) => d.date.split(" ")[0]);

  // 입차
  const entryCounts = filtered.map((d) =>
    d.title?.includes("입차") || d.type_record?.includes("입차")
      ? d.typeCounts?.["중장비 출입"] || 0
      : 0
  );

  // 출차
  const exitCounts = filtered.map((d) =>
    d.title?.includes("출차") || d.type_record?.includes("출차")
      ? d.typeCounts?.["중장비 출입"] || 0
      : 0
  );

  return {
    labels,
    datasets: [
      {
        label: "입차",
        data: entryCounts,
        borderColor: "#4dc9f6",
        backgroundColor: "rgba(77,201,246,0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "출차",
        data: exitCounts,
        borderColor: "#f67019",
        backgroundColor: "rgba(246,112,25,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
};
