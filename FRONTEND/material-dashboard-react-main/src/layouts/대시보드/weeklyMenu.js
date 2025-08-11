// src/components/WeeklyMenuFromCSV.js

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
// import MagicBento from "../../layouts/authentication/components/MagicBento/MagicBento.jsx";

/** =========================
 *  카드 (UI 동일, 빈 데이터 처리 추가)
 *  ========================= */
function WeeklyMenuCard({ items }) {
  const showItems = Array.isArray(items) ? items.slice(0, 2) : [];

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

      {/* 콘텐츠 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: showItems.length ? "center" : "flex-start",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {showItems.length ? (
          showItems.map((item, index) => (
            <Box key={index} sx={{ mb: index === 0 ? 2 : 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {item.day}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, fontSize: "0.8rem" }}
              >
                {String(item.menu || "")
                  .split("\n")
                  .map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
              </Typography>

              {index === 0 && (
                <Divider sx={{ mt: 2, mb: 1.2, borderColor: "#ccc", width: "310px", mx: "auto" }} />
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            표시할 메뉴가 없습니다.
          </Typography>
        )}
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

/** =========================
 *  CSV → 오늘/내일 메뉴만 표시
 *  ========================= */
function WeeklyMenuFromCSV() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 구글 스프레드시트 "웹에 게시" 후 CSV URL
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRhjXDLYS_NC5u2nqfMSBmoz5rNY1ZfAyDWz548H7io_PoRuzrsskXb3ZBWXRJG7THlH_6BKWdk0uu4/pub?gid=0&single=true&output=csv";

    fetch(csvUrl)
      .then((res) => res.text())
      .then((csvString) => {
        Papa.parse(csvString, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = Array.isArray(results.data) ? results.data : [];

            // 각 행에서 day/menu 컬럼 자동 탐색
            const normalized = rows
              .map((r) => {
                const keys = Object.keys(r);

                // dayKey 후보: 값에 (MM/DD) 포함, 또는 헤더가 요일/날짜/date/day 계열
                const dayKey =
                  keys.find((k) => /\(\d{2}\/\d{2}\)/.test(String(r[k] || ""))) ||
                  keys.find((k) => /(요일|날짜|date|day)/i.test(k)) ||
                  keys[0]; // 최후의 수단

                // menuKey 후보: menu/메뉴/중식/석식/식단 등
                const menuKey = keys.find((k) => /(menu|메뉴|중식|석식|식단)/i.test(k)) || keys[1]; // 최후의 수단

                return {
                  dayRaw: String(r[dayKey] ?? "").trim(),
                  menuRaw: String(r[menuKey] ?? "").trim(),
                };
              })
              .filter((x) => x.dayRaw || x.menuRaw);

            setItems(normalized);
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

  // 오늘 / 내일 MM/DD
  const today = new Date();
  const formatMMDD = (d) =>
    `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  const todayStr = formatMMDD(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatMMDD(tomorrow);

  // dayRaw 에서 (MM/DD) 추출해서 오늘/내일만
  const filteredItems = items
    .map(({ dayRaw, menuRaw }) => {
      const m = String(dayRaw).match(/\((\d{2}\/\d{2})\)/);
      const mmdd = m ? m[1] : null;
      return { day: dayRaw, menu: menuRaw, mmdd };
    })
    .filter((x) => x.mmdd === todayStr || x.mmdd === tomorrowStr);

  return <WeeklyMenuCard items={filteredItems} />;
}

export default WeeklyMenuFromCSV;
