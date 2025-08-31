import { supabase } from "./supabase";

export const updateUserName = async (user_id: string, name: string) => {
    console.log("updating user name to",name,"of user_id",user_id)
  const { error } = await supabase
    .from("Users")
    .update({ name })
    .eq("user_id", user_id);
  if (error) {
    throw new Error(error.message);
  }
};
