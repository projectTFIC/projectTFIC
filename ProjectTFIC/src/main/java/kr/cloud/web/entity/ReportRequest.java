package kr.cloud.web.entity;

public class ReportRequest {
	  private String userId;
	    private String date;
	    private String period;
	    private String section1;
	    private String section2;
	    private String section3;
	    private String section4;
	    private String section5;
	    private String reportType; 
	    // Getter & Setter
	    public String getUserId() { return userId; }
	    public void setUserId(String userId) { this.userId = userId; }

	    public String getDate() { return date; }
	    public void setDate(String date) { this.date = date; }

	    public String getPeriod() { return period; }
	    public void setPeriod(String period) { this.period = period; }

	    public String getSection1() { return section1; }
	    public void setSection1(String section1) { this.section1 = section1; }

	    public String getSection2() { return section2; }
	    public void setSection2(String section2) { this.section2 = section2; }

	    public String getSection3() { return section3; }
	    public void setSection3(String section3) { this.section3 = section3; }

	    public String getSection4() { return section4; }
	    public void setSection4(String section4) { this.section4 = section4; }

	    public String getSection5() { return section5; }
	    public void setSection5(String section5) { this.section5 = section5; }
	    
	    public String getReportType() {
	        return reportType;
	    }
	    public void setReportType(String reportType) {
	        this.reportType = reportType;
	    }

}
