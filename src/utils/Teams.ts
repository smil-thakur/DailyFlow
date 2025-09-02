// Remove user from team (set team_id to null)
export const removeUserFromTeam = async (user_id: string) => {
  const { error } = await supabase
    .from("Users")
    .update({ team_id: null })
    .eq("user_id", user_id);
  if (error) {
    throw new Error(`${error.message}`);
  }
};

// Change user's team (set team_id to new team_id)
export const changeUserTeam = async (user_id: string, team_id: string) => {
  const { error } = await supabase
    .from("Users")
    .update({ team_id })
    .eq("user_id", user_id);
  if (error) {
    throw new Error(`${error.message}`);
  }
};
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
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`${error.message}`);
  }
  const hasTeam = data !== null && data?.team_id !== null;
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

export const getTeamKeyOfUser = async (user_id: string): Promise<string> => {
  const { data, error } = await supabase
    .from("Users")
    .select("team_id")
    .eq("user_id", user_id)
    .single();
  if (error) {
    throw new Error(`${error.message}`);
  }
  if (!data || !data.team_id) {
    throw new Error("User is not in a team");
  }
  const { data: teamData, error: teamError } = await supabase
    .from("Teams")
    .select("team_key")
    .eq("team_id", data.team_id)
    .single();
  if (teamError) {
    throw new Error(`${teamError.message}`);
  }
  return teamData.team_key;
};

export const createTeam = async (
  team_name: string
): Promise<{ team_id: string; team_key: string }> => {
  // Generate a random 6-digit team key
  const team_key = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from("Teams")
    .insert([{ team_name, team_key }])
    .select("team_id, team_key")
    .single();
  if (error) {
    throw new Error(`${error.message}`);
  }
  return { team_id: data.team_id, team_key: data.team_key };
};
