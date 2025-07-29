export default function projectsTableData() {
  const columns = [
    { Header: "NO.", accessor: "no", align: "center" },
    { Header: "제목", accessor: "title", align: "left" },
    { Header: "작성자", accessor: "author", align: "center" },
    { Header: "날짜", accessor: "date", align: "center" },
  ];

  const rows = [
    {
      no: 5,
      title: "작업자 반사조끼 미착용",
      author: "최수연",
      date: "25/07/02",
    },
    {
      no: 6,
      title: "작업자 안전벨트 미착용",
      author: "정대영",
      date: "25/06/29",
    },
    {
      no: 7,
      title: "작업자 헬멧 미착용",
      author: "이승훈",
      date: "25/06/26",
    },
    {
      no: 8,
      title: "작업자 장갑 미착용",
      author: "김미소",
      date: "25/06/24",
    },
  ];

  return { columns, rows };
}
