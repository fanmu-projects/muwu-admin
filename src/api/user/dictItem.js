import request from "@/utils/request";

export function queryDictItemsPage(data) {
  return request({
    url: "muwu-web-api/user/dictItem/queryDictItemsPage",
    method: "post",
    data
  });
}

export function addDictItem(data) {
  return request({
    url: "muwu-web-api/user/dictItem/addDictItem",
    method: "post",
    data
  });
}

export function updateDictItem(data) {
  return request({
    url: "muwu-web-api/user/dictItem/updateDictItem",
    method: "post",
    data
  });
}

export function deleteDictItem(dictItemId) {
  return request({
    url: "muwu-web-api/user/dictItem/deleteDictItem/" + dictItemId,
    method: "post"
  });
}
