import request from "@/utils/request";
import qs from 'qs'

export function getFilePath (path) {
  data = qs.stringify(data)
  return request({
    url: "muwu-web-api/user/dict/queryDictsPage",
    method: "post",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  });
}
