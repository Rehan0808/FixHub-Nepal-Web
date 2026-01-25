import { User } from "../model/user.model";

export const findUserByEmail = (email: string) => {
  return User.findOne({ email });
};

export const createUser = (data: any) => {
  return User.create(data);
};
