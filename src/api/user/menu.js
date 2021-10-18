import request from "@/utils/request";

export function listMenuTree() {
  return request({
    url: "muwu-web-api/user/menu/listMenuTree",
    method: "post"
  });
}

export function addMenu(data) {
  return request({
    url: "muwu-web-api/user/menu/addMenu",
    method: "post",
    data
  });
}

export function updateMenu(data) {
  return request({
    url: "muwu-web-api/user/menu/updateMenu",
    method: "post",
    data
  });
}

export function deleteMenu(menuId) {
  return request({
    url: "muwu-web-api/user/menu/deleteMenu/" + menuId,
    method: "post"
  });
}

export function sortMenu(data) {
  return request({
    url: "muwu-web-api/user/menu/sortMenu",
    method: "post",
    data
  });
}

export function getMenu(menuId) {
  return request({
    url: "muwu-web-api/user/menu/getMenu/" + menuId,
    method: "post"
  });
}

export function updateMenuPermission(data) {
  return request({
    url: "muwu-web-api/user/menu/updateMenuPermission",
    method: "post",
    data
  });
}
