import type { UserDTO } from "@/Models/user_model";
import { supabase } from "./supabase";
import type { Schedule } from "@/Models/schedule_model";

export const addUser = async (name: string, team: string, id: string) => {
  const { data: existingUser, error } = await supabase
    .from("Users")
    .select("id")
    .eq("user_id", id)
    .limit(1);

  if (error) {
    throw new Error(`${error.details} ${error.message}`);
  }

  if (existingUser && existingUser.length === 0) {
    const { error } = await supabase.from("Users").insert([{ name, team }]);

    if (error) {
      throw new Error(`Error inserting schedule: ${error.message}`);
    }
  }
};

export const isAlreadyAdded = async (id: string) => {
  const { data, error } = await supabase
    .from("Users")
    .select("id")
    .eq("user_id", id)
    .limit(1);

  if (error) {
    throw new Error(`${error.message}`);
  }

  if (data && data.length !== 0) {
    return true;
  }
  return false;
};

export const clearSchedule = async (date: Date, userId: string) => {
  const d = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString();

  const { error } = await supabase
    .from("Schedules")
    .delete()
    .eq("date", d)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }
};

export const setUserSchedule = async (
  type: string,
  d: Date,
  userId: string
) => {
  const date = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  // Delete existing schedule for that user & date
  await supabase
    .from("Schedules")
    .delete()
    .eq("user_id", userId)
    .eq("date", date);

  // Insert new one
  const { error } = await supabase
    .from("Schedules")
    .insert({ type, date, user_id: userId });

  if (error) {
    throw new Error(`${error.message}`);
  }
};
export const getAllUsersSchedule = async (
  startDate: Date,
  endDate: Date
): Promise<Schedule[]> => {
  const startDateStr = new Date(
    startDate.getTime() - startDate.getTimezoneOffset() * 60000
  ).toISOString();
  const endDateStr = new Date(
    endDate.getTime() - endDate.getTimezoneOffset() * 60000
  ).toISOString();

  const { data, error } = await supabase
    .from("Schedules")
    .select("*")
    .gte("date", startDateStr)
    .lte("date", endDateStr);

  if (error) {
    throw new Error(error.message);
  }
  return data as Schedule[];
};

export const getAllUsers = async (): Promise<UserDTO[]> => {
  const { data, error } = await supabase.from("Users").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data as UserDTO[];
};

export const getNameFromEmail = (email: string) => {
  return email.split("@")[0];
};
