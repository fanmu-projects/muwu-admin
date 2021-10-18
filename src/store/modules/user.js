import { login, loginSocial, logout, getInfo } from "@/api/user/auth";
import { getUserTree } from "@/api/user/user";
import { getToken, setToken, removeToken } from "@/utils/auth";
import { resetRouter } from "@/router";
/* Layout */
import Layout from "@/layout";

const getDefaultState = () => {
  return {
    token: getToken(),
    name: "",
    avatar: ""
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: state => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  }
};

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password, imageCode, rememberMe, deviceId } = userInfo;
    return new Promise((resolve, reject) => {
      login(
        {
          username: username.trim(),
          password: password,
          imageCode: imageCode,
          rememberMe: rememberMe
        },
        deviceId
      )
        .then(response => {
          const { result } = response;
          commit("SET_TOKEN", result.access_token);
          setToken(result.access_token);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // user login social
  loginSocial({ commit }, principal) {
    return new Promise((resolve, reject) => {
      loginSocial({ principal: principal })
        .then(response => {
          const { result } = response;
          commit("SET_TOKEN", result.access_token);
          setToken(result.access_token);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // get user info
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo()
        .then(response => {
          const { result } = response;
          if (!result) {
            reject("Verification failed, please Login again.");
          }
          const { nickname } = result;
          commit("SET_NAME", nickname);
          commit(
            "SET_AVATAR",
            "http://himg.bdimg.com/sys/portrait/item/066fe585a5e4beb55f49548b32.jpg"
          );
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // user logout
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      logout()
        .then(() => {
          removeToken(); // must remove  token  first
          resetRouter();
          commit("RESET_STATE");
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // get user tree
  getUserTree({ commit }) {
    return new Promise((resolve, reject) => {
      getUserTree()
        .then(response => {
          const accessedRoutes = formatAsyncRouter(response.result);
          // 404 page must be placed at the end !!!
          accessedRoutes.push({ path: "*", redirect: "/404", hidden: true });
          resolve(accessedRoutes);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken(); // must remove  token  first
      commit("RESET_STATE");
      resolve();
    });
  }
};

// 遍历后台传来的路由字符串，转换为组件对象
function formatAsyncRouter(asyncRouter) {
  return asyncRouter.filter(route => {
    route.path = route.url;
    route.name = route.url;
    // route.hidden = false;
    route.meta = { title: route.menuName, icon: route.icon };
    if (route.component) {
      // Layout组件特殊处理
      if (route.component === "Layout") {
        route.component = Layout;
      } else {
        route.component = loadView(route.component);
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = formatAsyncRouter(route.children);
    }
    return true;
  });
}

export const loadView = view => {
  // 路由懒加载
  return resolve => require([`@/views${view}`], resolve);
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
