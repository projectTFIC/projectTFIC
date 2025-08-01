import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import BuildIcon from "@mui/icons-material/Build";
import WarningIcon from "@mui/icons-material/Warning";
import Slide from "@mui/material/Slide";

function LogHistory() {
  const [logItems, setLogItems] = useState([
    { id: 1, category: "equipment-access", text: "수구역 중장비(크레인) 출입", time: "08:24" },
    { id: 2, category: "accident", text: "C구역 사고 위험", time: "09:12" },
    { id: 3, category: "equipment-access", text: "C구역 중장비(덤프트럭) 출입", time: "11:57" },
    { id: 4, category: "safety-violation", text: "D구역 작업자(황철) 헬멧 미착용", time: "13:12" },
    { id: 5, category: "equipment-access", text: "D구역 중장비(크레인) 출입", time: "14:25" },
  ]);

  const [lastLogId, setLastLogId] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      const categories = ["equipment-access", "accident", "safety-violation"];
      const newCategory = categories[Math.floor(Math.random() * categories.length)];
      const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const randomTexts = {
        accident: ["C구역 사고 위험", "B구역 낙하물 감지", "D구역 안전사고 발생"],
        "equipment-access": ["A구역 중장비(크레인) 출입", "C구역 덤프트럭 진입", "B구역 장비 이동"],
        "safety-violation": [
          "E구역 작업자 마스크 미착용",
          "D구역 안전모 미착용",
          "F구역 반사조끼 미착용",
        ],
      };

      const textList = randomTexts[newCategory];
      const randomText = textList[Math.floor(Math.random() * textList.length)];

      const newLog = {
        id: lastLogId + 1,
        category: newCategory,
        text: randomText,
        time: currentTime,
      };

      setLogItems((prev) => [newLog, ...prev.slice(0, 19)]);
      setLastLogId((id) => id + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [lastLogId]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: "8px",
        backgroundColor: "#fefefe",
        height: 535,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ color: "black", fontWeight: 600, fontSize: "1rem" }}>
          로그 기록
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Stack spacing={1}>
          {logItems.map((log) => {
            let bgColor, iconColor, icon, label;
            switch (log.category) {
              case "accident":
                bgColor = "rgba(220,0,0,0.1)";
                iconColor = "red";
                icon = <ReportProblemIcon sx={{ fontSize: 18, color: iconColor }} />;
                label = "사고 감지";
                break;
              case "equipment-access":
                bgColor = "rgba(0,180,0,0.1)";
                iconColor = "green";
                icon = <BuildIcon sx={{ fontSize: 18, color: iconColor }} />;
                label = "입출입 감지";
                break;
              case "safety-violation":
                bgColor = "rgba(255,140,0,0.15)";
                iconColor = "orange";
                icon = <WarningIcon sx={{ fontSize: 18, color: iconColor }} />;
                label = "미착용 감지";
                break;
              default:
                bgColor = "#f0f0f0";
                icon = null;
                label = "감지";
            }

            const isRight = log.category === "accident";
            const isNew = log.id === lastLogId;

            const logBox = (
              <Box key={log.id}>
                <Box display="flex" justifyContent={isRight ? "flex-end" : "flex-start"}>
                  <Box
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    sx={{
                      backgroundColor: bgColor,
                      borderRadius: "10px",
                      p: 1.2,
                      width: "68%",
                      maxWidth: 460,
                    }}
                  >
                    <Box mt={0.2} mr={1}>
                      {icon}
                    </Box>
                    <Box flex={1}>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#333" }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#555", mt: 0.3 }}>
                        객체 감지 시스템에서 새로운 이벤트가 감지되었습니다
                      </Typography>
                      <Box display="flex" gap={0.8} mt={0.8}>
                        <Chip
                          label="B구역"
                          size="small"
                          sx={{
                            backgroundColor:
                              log.category === "accident"
                                ? "rgba(211, 47, 47, 0.1)"
                                : log.category === "safety-violation"
                                ? "rgba(245, 124, 0, 0.1)"
                                : "rgba(56, 142, 60, 0.1)",
                            border: `1px solid ${
                              log.category === "accident"
                                ? "#d32f2f"
                                : log.category === "safety-violation"
                                ? "#f57c00"
                                : "#388e3c"
                            }`,
                            color:
                              log.category === "accident"
                                ? "#d32f2f"
                                : log.category === "safety-violation"
                                ? "#f57c00"
                                : "#388e3c",
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 500,
                            borderRadius: "10px",
                            px: 1,
                          }}
                        />
                        <Chip
                          label="CAM-5"
                          size="small"
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.4)",
                            border: "1px solid #ccc",
                            color: "#555",
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 500,
                            borderRadius: "10px",
                            px: 1,
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        color: "#999",
                        fontSize: "0.65rem",
                        mt: 0.5,
                        minWidth: 50,
                        textAlign: "right",
                      }}
                    >
                      {log.time}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1, mb: 0.5 }} />
              </Box>
            );

            return isNew ? (
              <Slide key={log.id} direction="right" in mountOnEnter unmountOnExit timeout={600}>
                {logBox}
              </Slide>
            ) : (
              logBox
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}

export default LogHistory;
