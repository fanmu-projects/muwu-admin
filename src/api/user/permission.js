import request from "@/utils/request";

export function queryPermissionsPage(data) {
  return request({
    url: "muwu-web-api/user/permission/queryPermissionsPage",
    method: "post",
    data
  });
}

export function addPermission(data) {
  return request({
    url: "muwu-web-api/user/permission/addPermission",
    method: "post",
    data
  });
}

export function updatePermission(data) {
  return request({
    url: "muwu-web-api/user/permission/updatePermission",
    method: "post",
    data
  });
}

export function deletePermission(permissionId) {
  return request({
    url: "muwu-web-api/user/permission/deletePermission/" + permissionId,
    method: "post"
  });
}

export function listPermission(data) {
  return request({
    url: "muwu-web-api/user/permission/listPermission",
    method: "post",
    data
  });
}

export function getPermission(permissionId) {
  return request({
    url: "muwu-web-api/user/permission/getPermission/" + permissionId,
    method: "post"
  });
}

export function refreshCache() {
  return request({
    url: "muwu-web-api/user/permission/refreshCache",
    method: "post"
  });
}

export function batchUpdateWhitelist(data) {
  return request({
    url: "muwu-web-api/user/permission/batchUpdateWhitelist",
    method: "post",
    data
  });
}

export function batchUpdateRoleSharePermission(data) {
  return request({
    url: "muwu-web-api/user/permission/batchUpdateRoleSharePermission",
    method: "post",
    data
  });
}
