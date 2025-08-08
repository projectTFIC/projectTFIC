// src/components/WeatherContainer.js

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Typography, Divider, Box } from "@mui/material";
import { Player } from "@lottiefiles/react-lottie-player";
import rainyDay from "../../assets/lottie/RainyDay.json";
import MagicBento from "../../layouts/authentication/components/MagicBento/MagicBento.jsx";

const SERVICE_KEY =
  "wksMHekX%2FKUih83RjZB90drNGaJP0jYxTheUXe658Z7egUvB7mpEKjxR5iDf%2Bl4lyY1hgcHInc52z%2FvbAjCEvg%3D%3D"; // 이미 인코딩된 키

// 서울 격자 기본값
const DEFAULT_NX = 60;
const DEFAULT_NY = 127;

function convertGRID_GPS(lat, lon) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;

  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;

  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let rs = {};
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);

  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  rs.x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  rs.y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return rs;
}

const getToday = () => {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  return yyyy + mm + dd;
};

const getBaseTime = () => {
  const now = new Date();
  const hour = now.getHours();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let baseHour = baseTimes[0];
  for (let i = baseTimes.length - 1; i >= 0; i--) {
    if (hour >= baseTimes[i]) {
      baseHour = baseTimes[i];
      break;
    }
  }
  return baseHour.toString().padStart(2, "0") + "00";
};

const parseWeatherCondition = (pty, sky) => {
  if (pty === "0") {
    switch (sky) {
      case "1":
        return "맑음";
      case "3":
        return "구름 많음";
      case "4":
        return "흐림";
      default:
        return "날씨 정보 없음";
    }
  } else {
    switch (pty) {
      case "1":
        return "비";
      case "2":
        return "비/눈";
      case "3":
        return "눈";
      case "5":
        return "빗방울";
      case "6":
        return "빗방울눈날림";
      case "7":
        return "눈날림";
      default:
        return "강수 정보";
    }
  }
};

function TodayWeatherCard({ temp, min, max, condition }) {
  return (
    <Card
      sx={{
        height: "100%",
        p: 2.5,
        borderRadius: 3,
        background: "linear-gradient(135deg, #f9fafe, #e9ecf5)",
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        오늘의 날씨
      </Typography>

      <Divider sx={{ my: 1.5 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
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
};

TodayWeatherCard.defaultProps = {
  temp: 32,
  min: 30,
  max: 33,
  condition: "약간 흐림 / 비",
};

function WeatherContainer() {
  const [weather, setWeather] = useState(null);
  const [nx, setNx] = useState(DEFAULT_NX);
  const [ny, setNy] = useState(DEFAULT_NY);

  // 위치 정보 불러오고 날씨 fetch
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const { x, y } = convertGRID_GPS(latitude, longitude);
        setNx(x);
        setNy(y);
        fetchWeather(x, y);
      },
      () => {
        fetchWeather(DEFAULT_NX, DEFAULT_NY);
      }
    );
  }, []);

  // 날씨 API 호출 함수
  const fetchWeather = async (nxParam, nyParam) => {
    const base_date = getToday();
    const base_time = getBaseTime();

    const url =
      `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?` +
      `serviceKey=${SERVICE_KEY}` +
      `&numOfRows=100&pageNo=1&base_date=${base_date}&base_time=${base_time}` +
      `&nx=${nxParam}&ny=${nyParam}&dataType=JSON`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP 에러! 상태: ${response.status}`);

      const data = await response.json();
      const items = data.response.body.items.item;

      // base_time을 포함한 후보시간 리스트 (최신부터 검토)
      const candidateTimes = [
        base_time,
        (parseInt(base_time, 10) + 100).toString().padStart(4, "0"),
        (parseInt(base_time, 10) + 200).toString().padStart(4, "0"),
        (parseInt(base_time, 10) + 300).toString().padStart(4, "0"),
      ].filter((t) => t <= "2300");

      // 카테고리별 값 찾기 함수 (최신 후보시간 기준 탐색)
      const findValueByCategory = (category) => {
        for (let t of candidateTimes) {
          const item = items.find(
            (i) => i.fcstDate === base_date && i.category === category && i.fcstTime === t
          );
          if (item) return item.fcstValue;
        }
        return null;
      };

      const currentTmp = findValueByCategory("TMP");
      const pty = findValueByCategory("PTY");
      const sky = findValueByCategory("SKY");

      // TMP 데이터에서 오늘 최저/최고 직접 계산
      const todayTmpItems = items.filter((i) => i.category === "TMP" && i.fcstDate === base_date);
      const tmpValues = todayTmpItems.map((item) => Number(item.fcstValue));
      const minTmp = tmpValues.length > 0 ? Math.min(...tmpValues) : 0;
      const maxTmp = tmpValues.length > 0 ? Math.max(...tmpValues) : 0;

      const condition = parseWeatherCondition(pty, sky);

      setWeather({
        temp: currentTmp ? Number(currentTmp) : 0,
        min: minTmp,
        max: maxTmp,
        condition,
      });
    } catch (error) {
      console.error("날씨 정보 조회 중 오류 발생:", error);
    }
  };

  if (!weather) return <div>날씨 정보를 불러오는 중...</div>;

  return (
    <TodayWeatherCard
      temp={weather.temp}
      min={weather.min}
      max={weather.max}
      condition={weather.condition}
    />
  );
}

export default WeatherContainer;
