import { supabase } from "./supabase";

export const verifyTeamKey = async (key: string): Promise<string> => {
  const { data, error } = await supabase
    .from("Teams")
    .select("team_id")
    .eq("team_key", key)
    .single();

  if (error) {
    throw new Error(`${error.message}`);
  }
  if (!data || data.team_id === null) {
    throw new Error("Not able to find your team");
  }
  return data.team_id;
};

export const isUserInTeam = async (user_id: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("Users")
    .select("team_id")
    .eq("user_id", user_id)
    .single();
  if (error) {
    throw new Error(`${error.message}`);
  }
  const hasTeam = data?.team_id !== null;
  return hasTeam;
};

export const getTeamName = async (team_id: string): Promise<string> => {
  const { data, error } = await supabase
    .from("Teams")
    .select("team_name")
    .eq("team_id", team_id)
    .single();

  if (error) {
    throw new Error(`${error.message}`);
  }
  if (!data || data.team_name === null) {
    throw new Error("Not able to find your team");
  }
  return data.team_name;
};

export const getTeamOfUser = async (user_id: string): Promise<string> => {
  const { data, error } = await supabase
    .from("Users")
    .select("team_id")
    .eq("user_id", user_id)
    .single();
  if (error) {
    throw new Error(`${error.message}`);
  }
  return data.team_id;
};

export const addUserToTeam = async (team_id: string, user_id: string) => {
  const { error } = await supabase
    .from("Users")
    .update({ team_id: team_id })
    .eq("user_id", user_id);

  if (error) {
    throw new Error(`${error.message}`);
  }
};
