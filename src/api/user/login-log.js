import request from "@/utils/request";

export function statisticsData() {
  return request({
    url: "muwu-web-api/user/loginLog/statisticsData",
    method: "post"
  });
}
