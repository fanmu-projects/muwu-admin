import request from "@/utils/request";

export function queryUsersPage(data) {
  return request({
    url: "muwu-web-api/user/user/queryUsersPage",
    method: "post",
    data
  });
}

export function addUser(data) {
  return request({
    url: "muwu-web-api/user/user/addUser",
    method: "post",
    data
  });
}

export function updateUser(data) {
  return request({
    url: "muwu-web-api/user/user/updateUser",
    method: "post",
    data
  });
}

export function deleteUser(userId) {
  return request({
    url: "muwu-web-api/user/user/deleteUser/" + userId,
    method: "post"
  });
}

export function resetUsertPassword(data) {
  return request({
    url: "muwu-web-api/user/user/resetUsertPassword",
    method: "post",
    data
  });
}

export function getUser(userId) {
  return request({
    url: "muwu-web-api/user/user/getUser/" + userId,
    method: "post"
  });
}

export function getUserTree() {
  return request({
    url: "muwu-web-api/user/user/getUserTree",
    method: "post"
  });
}
