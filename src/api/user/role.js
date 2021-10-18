import request from "@/utils/request";

export function queryRolesPage(data) {
  return request({
    url: "muwu-web-api/user/role/queryRolesPage",
    method: "post",
    data
  });
}

export function addRole(data) {
  return request({
    url: "muwu-web-api/user/role/addRole",
    method: "post",
    data
  });
}

export function updateRole(data) {
  return request({
    url: "muwu-web-api/user/role/updateRole",
    method: "post",
    data
  });
}

export function deleteRole(roleId) {
  return request({
    url: "muwu-web-api/user/role/deleteRole/" + roleId,
    method: "post"
  });
}

export function getRole(roleId) {
  return request({
    url: "muwu-web-api/user/role/getRole/" + roleId,
    method: "post"
  });
}

export function listRole() {
  return request({
    url: "muwu-web-api/user/role/listRole",
    method: "post"
  });
}

export function updateRolePermission(data) {
  return request({
    url: "muwu-web-api/user/role/updateRolePermission",
    method: "post",
    data
  });
}

export function refreshCache() {
  return request({
    url: "muwu-web-api/user/role/refreshCache",
    method: "post"
  });
}
