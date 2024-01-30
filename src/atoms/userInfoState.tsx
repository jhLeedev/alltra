import { atom } from "recoil";

export const emailState = atom({
  key: "emailState",
  default: ""
});

export const passwordState = atom({
  key: "passwordState",
  default: ""
});

export const nicknameState = atom({
  key: "nicknameState",
  default: ""
});

export const isLoggedInState = atom({
  key: "isLoggedInState",
  default: false
});

export const selectedCityState = atom({
  key: "selectedCityState",
  default: "전체"
});

export const selectedCategoryState = atom({
  key: "selectedCategoryState",
  default: "전체"
});

export const currentPageState = atom({
  key: "currentPageState",
  default: 1
});

export const myPostCurrentPageState = atom({
  key: "myPostCurrentPageState",
  default: 1
});

export const myCommentCurrentPageState = atom({
  key: "myCommentCurrentPageState",
  default: 1
});

export const totalPagesState = atom({
  key: "totalPagesState",
  default: 1
});

export const myPostTotalPagesState = atom({
  key: "myPostTotalPagesState",
  default: 1
});

export const myCommentTotalPagesState = atom({
  key: "myCommentTotalPagesState",
  default: 1
});

export const searchTermState = atom({
  key: "searchTermState",
  default: ""
});

export const isModalOpenState = atom({
  key: "isModalOpenState",
  default: false
});

export const chatToState = atom({
  key: "chatToState",
  default: {
    userId: "",
    nickname: ""
  }
});