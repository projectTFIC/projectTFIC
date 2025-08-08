// src/components/WeeklyMenuFromCSV.js

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MagicBento from "../../layouts/authentication/components/MagicBento/MagicBento.jsx";

/**
 * WeeklyMenuCard 컴포넌트
 * props.items: [{ day: string, menu: string }]
 * items의 처음 두 개 항목만 중앙 정렬해서 보여줌
 */
function WeeklyMenuCard({ items }) {
  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #f9fafe, #e9ecf5)",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {/* 제목: 왼쪽 정렬 */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        주간 메뉴표
      </Typography>

      {/* 구분선 */}
      <Divider sx={{ my: 1.5, borderBottomWidth: 2 }} />

      {/* 중앙 정렬된 이틀치 메뉴 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {items.slice(0, 2).map((item, index) => (
          <Box key={index} sx={{ mb: index === 0 ? 2 : 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {item.day}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "0.8rem" }}>
              {item.menu.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </Typography>

            {/* 첫 항목 아래에만 구분선 */}
            {index === 0 && (
              <Divider sx={{ mt: 2, mb: 1.2, borderColor: "#ccc", width: "310px", mx: "auto" }} />
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
}

WeeklyMenuCard.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      menu: PropTypes.string.isRequired,
    })
  ),
};

WeeklyMenuCard.defaultProps = {
  items: [],
};

/**
 * WeeklyMenuFromCSV 컴포넌트
 * - 구글 시트 CSV URL에서 메뉴 데이터 fetch 후 파싱
 * - 당일, 내일 메뉴만 필터링해서 WeeklyMenuCard에 전달
 */
function WeeklyMenuFromCSV() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 구글 스프레드시트 "웹에 게시" 후 CSV URL을 넣어주세요
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRhjXDLYS_NC5u2nqfMSBmoz5rNY1ZfAyDWz548H7io_PoRuzrsskXb3ZBWXRJG7THlH_6BKWdk0uu4/pub?gid=0&single=true&output=csv";

    fetch(csvUrl)
      .then((res) => res.text())
      .then((csvString) => {
        Papa.parse(csvString, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setItems(results.data);
          },
          error: (error) => {
            console.error("CSV 파싱 실패:", error);
          },
        });
      })
      .catch((err) => {
        console.error("CSV fetch 실패:", err);
      });
  }, []);

  // 오늘, 내일 MM/DD 문자열 생성
  const today = new Date();
  const formatMMDD = (date) =>
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    date.getDate().toString().padStart(2, "0");
  const todayStr = formatMMDD(today);

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatMMDD(tomorrow);

  // day 문자열에서 MM/DD 추출해 당일, 내일만 필터링
  const filteredItems = items.filter((item) => {
    const match = item.day.match(/\((\d{2}\/\d{2})\)/);
    if (!match) return false;
    const dateStr = match[1];
    return dateStr === todayStr || dateStr === tomorrowStr;
  });

  return <WeeklyMenuCard items={filteredItems} />;
}

export default WeeklyMenuFromCSV;
