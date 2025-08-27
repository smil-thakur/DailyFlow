import type { ScheduleType } from "./schedule_type_model";

export type Schedule = {
  id: string;
  type: ScheduleType;
  user_id: string;
  date: Date;
  create_at: Date;
};
