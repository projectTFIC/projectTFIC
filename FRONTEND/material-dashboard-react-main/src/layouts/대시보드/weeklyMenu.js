import React from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

function WeeklyMenuCard({ items }) {
  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: "100%",
        display: "flex",
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
        {items.slice(0, 2).map((it, idx) => (
          <Box key={idx} sx={{ mb: idx === 0 ? 2 : 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {it.day}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {it.menu.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </Typography>

            {/* 첫 항목 아래에만 구분선 */}
            {idx === 0 && (
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
  items: [
    {
      day: "월요일 (08/01)",
      menu: "백미밥\n두부계란국\n제육볶음\n상추쌈\n열무김치",
    },
    {
      day: "화요일 (08/02)",
      menu: "백미밥\n아욱국\n닭갈비\n숙주나물무침\n포기김치",
    },
  ],
};

export default WeeklyMenuCard;
