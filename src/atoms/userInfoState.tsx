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

export const totalPagesState = atom({
  key: "totalPagesState",
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
