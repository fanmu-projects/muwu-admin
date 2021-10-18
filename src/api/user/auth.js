import request from '@/utils/request'
import qs from 'qs'

export function login(data, deviceId) {
  data = qs.stringify(data)
  return request({
    url: '/muwu-auth/auth/form',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'deviceId': deviceId
    },
    data
  })
}

export function loginSocial(data) {
  data = qs.stringify(data)
  return request({
    url: '/muwu-auth/auth/social',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

export function getInfo() {
  return request({
    url: '/muwu-auth/auth/getUserInfo',
    method: 'post'
  })
}

export function logout() {
  return request({
    url: '/muwu-auth/auth/logout',
    method: 'post'
  })
}

export function getCodeImage(deviceId) {
  return request({
    url: '/muwu-auth/auth/code/image',
    method: 'post',
    headers: {
      'deviceId': deviceId
    }
  })
}
