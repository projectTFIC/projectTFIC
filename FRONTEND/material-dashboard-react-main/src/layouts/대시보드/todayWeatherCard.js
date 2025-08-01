import React from "react";
import PropTypes from "prop-types";
import { Card, Typography, Divider, Box } from "@mui/material";
import { Player } from "@lottiefiles/react-lottie-player";
import rainyDay from "../../assets/lottie/RainyDay.json";

function TodayWeatherCard({ temp, min, max, condition, icon }) {
  return (
    <Card sx={{ height: "100%", p: 2.5, borderRadius: 3 }}>
      {/* 제목 */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        오늘의 날씨
      </Typography>

      <Divider sx={{ my: 1.5 }} />

      {/* 애니메이션 + 온도 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // 세로 배치
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Box sx={{ width: 300, height: 280 }}>
          <Player autoplay loop src={rainyDay} style={{ width: "100%", height: "100%" }} />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1, mt: 1 }}>
          {temp}°
        </Typography>
      </Box>

      {/* 최고/최저 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1.5 }}>
          최저 <b>{min}°</b>
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Typography variant="body2" sx={{ ml: 1.5 }}>
          최고 <b>{max}°</b>
        </Typography>
      </Box>

      {/* 상태 설명 */}
      <Typography variant="body2" align="center" color="text.secondary">
        {condition}
      </Typography>
    </Card>
  );
}

TodayWeatherCard.propTypes = {
  temp: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  condition: PropTypes.string,
  icon: PropTypes.string,
};

TodayWeatherCard.defaultProps = {
  temp: 32,
  min: 30,
  max: 33,
  condition: "약간 흐림 / 비",
  icon: "wb_cloudy", // 사용 안함
};

export default TodayWeatherCard;
