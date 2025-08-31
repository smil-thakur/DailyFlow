
import { Button } from "@/components/ui/button"
import { useAuth } from "@/auth/AuthContext"
import { ModeToggle } from "@/components/ui/mode-toggle"
import {
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths
} from 'date-fns';
import { getAllUsersSchedule, clearSchedule } from "@/utils/users";
import { ChangeUsernameModal } from "@/components/ui/change-username-modal";
import { updateUserName } from "@/utils/updateUserName";
import { addUser } from "@/utils/users";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getAllUsers, setUserSchedule, isAlreadyAdded } from "@/utils/users";
import type { UserDTO } from "@/Models/user_model";
import { usePreloader } from "@/providers/PreloaderProvider";
import { Card, CardContent } from "@/components/ui/card";
import type { ScheduleType } from "@/Models/schedule_type_model";
import type { Schedule } from "@/Models/schedule_model";
import { isHoliday } from "@/utils/calender";
import { LucideCalendar, LucideCalendarCheck, LucideChevronLeft, LucideChevronRight, LucideCircleEllipsis, LucideHouse, LucideLogOut, LucideTrash, LucideUser, LucideUserPen, LucideUserX } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
import { Badge } from "@/components/ui/badge"


const HomePage = () => {
    const auth = useAuth();
    const preloaderProvider = usePreloader();
    const [users, setUsers] = useState<UserDTO[]>([])
    const [schedules, SetSchedules] = useState<Schedule[]>([])

    const [isAdded, setIsAdded] = useState(false);
    const [showChangeUsername, setShowChangeUsername] = useState(false);
    const [currentUserName, setCurrentUserName] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Improved color palette for better UX and accessibility
    const getScheduleClass = (type: string) => {
        switch (type) {
            case 'L': return "bg-rose-100 text-rose-700 font-bold border-r border-rose-200"; // Leave
            case 'W': return "bg-sky-100 text-sky-700 font-bold border-r border-sky-200"; // WFH
            case 'E': return "bg-teal-100 text-teal-700 font-bold border-r border-teal-200"; // Extra (teal)
            case 'C': return "bg-purple-100 text-purple-700 font-bold border-r border-purple-200"; // Compensation (purple)
            default: return "";
        }
    };

    const handleScroll = () => {
        const today = new Date();
        if (
            currentMonth.getFullYear() !== today.getFullYear() ||
            currentMonth.getMonth() !== today.getMonth()
        ) {
            setCurrentMonth(today);
            return;
        }
        const el = document.getElementById("today");
        if (el) {
            el.scrollIntoView({
                behavior: "smooth",
                inline: "start",
                block: "nearest"
            });
        }
    };

    // Office days: Mon, Thu, Fri (1, 4, 5) - yellow; Weekends: Sun, Sat (0, 6) - indigo; Default: gray
    const getHeaderClass = (day: number) => {
        if (day === 1 || day === 4 || day === 5) {
            return "bg-amber-100 text-amber-900 font-semibold"; // Office days (yellow)
        } else if (day === 0 || day === 6) {
            return "bg-indigo-100 text-indigo-800 font-semibold"; // Weekends (indigo)
        } else {
            return "bg-gray-50 text-gray-700";
        }
    };

    const handleAddInTeam = async () => {
        const name = auth.user?.email?.split("@")[0]
        const id = auth.user?.id
        try {
            await addUser(name!, "upgrade", id!)
            await getUsers()
            await getSchedules(start, end);
            toast("Done")
        }
        catch (err) {
            toast(`${err}`)
        }
    }

    const handleScheduleSelection = async (event: ScheduleType | "clear", date: Date, userId: string) => {
        try {
            preloaderProvider.show();
            if (event === "clear") {
                await clearSchedule(date, userId);
            } else {
                await setUserSchedule(event, date, userId);
            }
            await getSchedules();
            preloaderProvider.hide();
        } catch (err) {
            preloaderProvider.hide();
            toast(`${err}`);
        }
    }

    const getUsers = async () => {
        try {
            preloaderProvider.show()
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            console.log(allUsers)
            const me = allUsers.find(u => u.user_id === auth.user?.id);
            if (me) setCurrentUserName(me.name);
            preloaderProvider.hide()
        }
        catch (err) {
            preloaderProvider.hide()
            toast(`${err}`)
        }
    }
    const handleChangeUsername = async (newName: string) => {
        try {
            if (!auth.user?.id) throw new Error("No user id");
            await updateUserName(auth.user.id, newName);
            await getUsers();
            toast("Username updated!");
        } catch (err) {
            toast.error(`${err}`)
        }
    };

    const getIsAllreadyAdded = async (id: string) => {
        try {
            const isAdded = await isAlreadyAdded(id)
            setIsAdded(isAdded)
            preloaderProvider.hide()
        }
        catch (err) {
            preloaderProvider.hide()
            toast(`${err}`)
        }
    }

    const getSchedules = async (rangeStart = start, rangeEnd = end) => {
        try {
            preloaderProvider.show()
            const newSchedules = await getAllUsersSchedule(rangeStart, rangeEnd);
            SetSchedules(newSchedules)
            preloaderProvider.hide()
        }
        catch (err) {
            preloaderProvider.hide()
            toast(`${err}`)
        }
    }

    const getScheduleDisplay = (userId: string, date: Date): string => {
        const localDateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];
        const schedule = schedules.find(s => {
            return s.user_id === userId && s.date.toString() === localDateStr
        }
        );
        if (!schedule) return '-';

        switch (schedule.type) {
            case 'wfh': return 'W';
            case 'leave': return 'L';
            case 'extra': return 'E';
            case 'compensation': return 'C';
            default: return '-';
        }
    }

    useEffect(() => {
        handleScroll()
    }, [users])

    useEffect(() => {
        getUsers();
        getIsAllreadyAdded(auth.user?.id!);
    }, []);

    useEffect(() => {
        getSchedules(start, end);
    }, [currentMonth]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') setCurrentMonth(prev => subMonths(prev, 1));
            if (e.key === 'ArrowRight') setCurrentMonth(prev => addMonths(prev, 1));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return <>
        <ChangeUsernameModal
            isOpen={showChangeUsername}
            onClose={() => setShowChangeUsername(false)}
            onSubmit={handleChangeUsername}
            initialName={currentUserName}
        />
        <div className="flex flex-col mt-0 px-[24px] w-full">
            <Card className="mb-4">
                <CardContent>
                    <div className="flex items-center flex-col gap-4 lg:flex-row lg:justify-between">
                        <div className="flex items-center gap-4 justify-between w-full lg:justify-start">
                            <div className="flex flex-col">
                                <div className="text-xl md:text-2xl font-bold">
                                    Upgrade team's
                                </div>
                                <div>
                                    Calender
                                </div>
                            </div>
                            <div className="flex justify-between items-center border rounded-xl p-2 bg-muted">
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
                                    <LucideChevronLeft></LucideChevronLeft>
                                </Button>
                                <span className="mx-2">{start.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
                                    <LucideChevronRight></LucideChevronRight>
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 flex-col sm:flex-row">
                            <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <LucideUser></LucideUser>
                                            {currentUserName}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="start">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => setShowChangeUsername(true)}>
                                            <LucideUserPen></LucideUserPen>
                                            Change username
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { auth.signOut() }}>
                                            <LucideLogOut></LucideLogOut>
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button onClick={() => { handleScroll() }} variant="outline"><LucideCalendar></LucideCalendar> Today</Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <ModeToggle></ModeToggle>
                                <Button style={{ "display": isAdded ? "none" : "block" }} disabled={isAdded} onClick={() => { handleAddInTeam() }}>Add me</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card id="legends" className="mb-4">
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <div>
                            Legends
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-rose-100 text-rose-700 border border-rose-200 font-bold">L - Leave</Badge>
                            <Badge className="bg-sky-100 text-sky-700 border border-sky-200 font-bold">W - WFH</Badge>
                            <Badge className="bg-teal-100 text-teal-700 border border-teal-200 font-bold">E - Extra</Badge>
                            <Badge className="bg-purple-100 text-purple-700 border border-purple-200 font-bold">C - Compensation</Badge>
                            <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold">SAT/SUN</Badge>
                            <Badge className="bg-amber-100 text-amber-900 border border-amber-200 font-semibold">Office day</Badge>
                            <Badge className="bg-pink-200 text-pink-900 border border-pink-300 font-bold">Office Holiday</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="border rounded-xl overflow-hidden mb-10">
                <div className="overflow-x-auto">
                    <div className="min-w-fit">
                        <div id="header" className="flex">
                            <div className="sticky left-0 z-20 w-[150px] shrink-0 p-2 md:p-4 font-semibold text-center border-b border-r border-border/50 bg-card text-xs md:text-sm">
                                Team Member
                            </div>
                            {days.map(d => {
                                const isToday = (() => {
                                    const now = new Date();
                                    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                })();
                                const borderClass = isToday ? "border-l-2 border-b-2 border-r-2 border-purple-800 font-bold" : "";

                                return (
                                    <div
                                        key={d.toISOString()}
                                        className={`flex border-r border-b ${borderClass} ${getHeaderClass(d.getDay())} ${isHoliday(d) ? "bg-pink-200 text-pink-900 font-bold" : ""} flex-col items-center w-[40px] justify-center shrink-0`}
                                    >
                                        <div className="font-semibold text-xs">{d.getDate()}</div>
                                        <div className="text-xs">{weekdayNames[d.getDay()]}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div id="body">
                            {users.map(u => (
                                <div key={u.user_id} className="flex">
                                    <div className="sticky left-0 z-10 w-[150px] shrink-0 p-2 md:p-4 font-semibold text-center border-b border-r border-border/50 bg-card text-xs md:text-sm">
                                        {u.name}
                                    </div>
                                    {days.map(d => {
                                        const val = getScheduleDisplay(u.user_id, d);
                                        const isToday = (() => {
                                            const now = new Date();
                                            return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                        })();
                                        const borderClass = isToday ? "border-l-2 border-b-2 border-r-2 border-purple-800 font-bold" : "";

                                        return (
                                            <div
                                                key={d.toISOString()}
                                                className={`flex border-r border-b ${getScheduleClass(val)} ${borderClass} ${getHeaderClass(d.getDay())} ${isHoliday(d) ? "bg-pink-200 text-pink-900 font-bold" : ""} flex-col items-center w-[40px] justify-center`}
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-full rounded-none w-[40px]">
                                                            {val}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56" align="start">
                                                        <DropdownMenuLabel>My Status</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleScheduleSelection("wfh", d, u.user_id)}>
                                                            <LucideHouse /> WFH
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleScheduleSelection("leave", d, u.user_id)}>
                                                            <LucideUserX /> Leave
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleScheduleSelection("compensation", d, u.user_id)}>
                                                            <LucideCalendarCheck /> Compensation
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleScheduleSelection("extra", d, u.user_id)}>
                                                            <LucideCircleEllipsis /> Extra
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleScheduleSelection("clear", d, u.user_id)}>
                                                            <LucideTrash /> Clear
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </>
}

export default HomePage;