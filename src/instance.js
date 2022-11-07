import axios from "axios";
import { getCookie } from "./hooks/CookieHook";
const instance = axios.create({
  baseURL: "https://www.iceflower.shop/",
});

export const signUpApi = {
  postSingup: (userinfo) => instance.post("/users/signup", userinfo),
};

export const loginApi = {
  postLogin: (userlogin) => instance.post("/users/login", userlogin),
};

export const userApi = {
  getUser: () =>
    instance.get("/users", {
      headers: {
        Authorization: `${getCookie("accessToken")}`,
      },
    }),

  editUser: (EditUser) =>
    instance.put("/users", EditUser, {
      headers: {
        Authorization: `${getCookie("accessToken")}`,
      },
    }),
};


export const postApi = {
  // postDetail: () => instance.post(`/posts`),
  // getDetail: () => instance.get(`/posts`),
  getDetailId: () => instance.get(`/posts/{postid}`),
  editDetail: () => instance.post(`/posts/{postid}`),
  delDetail: () => instance.post(`/posts/{postid}`),
};

export const commentsApi = {
  getComments: () => instance.get(`/comments/{postid}`),
  postComments: () => instance.post(`/comments/{posetid}`),
  editComments: () => instance.put(`/comments/{commentid}`),
  delComments: () => instance.delete(`/comments/{commentid}`),
  
export const postsApi = {
  getPosts: () => {
    return instance.get("/posts");
  },
  creatPost: (inputs) => {
    return instance.post(`/posts`, inputs, {
      headers: {
        Authorization: `${getCookie("accessToken")}`,
      },
    });
  },
  deletePost: (params) =>
    instance.delete(
      `/posts/${params}`
      // {
      //   headers: { Authorization: `Bearer ${token}` },
      // }
    ),
  updatePost: (payload) =>
    instance.patch(
      `/posts/${payload.postId}`,
      payload.post
      //  {
      //   headers: { Authorization: `Bearer ${token}` },
      // }
    ),
};
