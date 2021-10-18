import request from "@/utils/request";

export function queryDictsPage(data) {
  return request({
    url: "muwu-web-api/user/dict/queryDictsPage",
    method: "post",
    data
  });
}

export function addDict(data) {
  return request({
    url: "muwu-web-api/user/dict/addDict",
    method: "post",
    data
  });
}

export function updateDict(data) {
  return request({
    url: "muwu-web-api/user/dict/updateDict",
    method: "post",
    data
  });
}

export function deleteDict(dictId) {
  return request({
    url: "muwu-web-api/user/dict/deleteDict/" + dictId,
    method: "post"
  });
}

export function getListDictItem(dictCode) {
  return request({
    url: "muwu-web-api/user/dict/getListDictItem/" + dictCode,
    method: "post"
  });
}
