import request from "@/utils/request";

export function queryPermissionCategorysPage(data) {
  return request({
    url: "muwu-web-api/user/permissionCategory/queryPermissionCategorysPage",
    method: "post",
    data
  });
}

export function addPermissionCategory(data) {
  return request({
    url: "muwu-web-api/user/permissionCategory/addPermissionCategory",
    method: "post",
    data
  });
}

export function updatePermissionCategory(data) {
  return request({
    url: "muwu-web-api/user/permissionCategory/updatePermissionCategory",
    method: "post",
    data
  });
}

export function deletePermissionCategory(permissionId) {
  return request({
    url: "muwu-web-api/user/permissionCategory/deletePermissionCategory/" + permissionId,
    method: "post"
  });
}

export function listPermissionCategory() {
  return request({
    url: "muwu-web-api/user/permissionCategory/listPermissionCategory",
    method: "post"
  });
}

export function getPermissionCategory(permissionCategoryId) {
  return request({
    url: "muwu-web-api/user/permissionCategory/getPermissionCategory/" + permissionCategoryId,
    method: "post"
  });
}

export function generatePermission() {
  return request({
    url: "muwu-web-api/user/permissionCategory/generatePermission",
    method: "post"
  });
}
