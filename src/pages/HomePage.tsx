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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateUserName } from "@/utils/updateUserName";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { getAllUsers, setUserSchedule } from "@/utils/users";
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
import { getTeamName, getTeamOfUser, removeUserFromTeam, changeUserTeam, verifyTeamKey, getTeamKeyOfUser } from "@/utils/Teams";


const HomePage = () => {
    const auth = useAuth();
    const preloaderProvider = usePreloader();
    const [users, setUsers] = useState<UserDTO[]>([])
    const [schedules, SetSchedules] = useState<Schedule[]>([])
    const [teamName, setTeamName] = useState<string>("");

    const [showChangeUsername, setShowChangeUsername] = useState(false);
    const [usernameInput, setUsernameInput] = useState("");
    const [showLeaveTeam, setShowLeaveTeam] = useState(false);
    const loginUserId = useRef<string|null>(null);
    const [currentUserName, setCurrentUserName] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const [showChangeTeam, setShowChangeTeam] = useState(false);
    const [newTeamKey, setNewTeamKey] = useState("");
    const [changeLoading, setChangeLoading] = useState(false);
    const handleLeaveTeam = async () => {
        if (!auth.user?.id) return;
        setChangeLoading(true);
        try {
            await removeUserFromTeam(auth.user.id);
            toast.success("You have left the team.");
            window.location.reload();
        } catch (err) {
            toast.error(`Failed to leave team: ${err}`);
        } finally {
            setChangeLoading(false);
        }
    };

    const handleChangeTeam = async () => {
        if (!auth.user?.id || !newTeamKey) return;
        setChangeLoading(true);
        try {
            const newTeamId = await verifyTeamKey(newTeamKey);
            await changeUserTeam(auth.user.id, newTeamId);
            toast.success("Team changed successfully!");
            setShowChangeTeam(false);
            setNewTeamKey("");
            window.location.reload();
        } catch (err) {
            toast.error(`Failed to change team: ${err}`);
        } finally {
            setChangeLoading(false);
        }
    };


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

    const getTeam = async () => {
        try {
            const id = await getTeamOfUser(auth.user?.id!)
            const name = await getTeamName(id)
            setTeamName(name)
        }
        catch (err) {
            toast.error(`${err}`)
        }
    }

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
            const me = allUsers.find(u => u.user_id === auth.user?.id);
            if (me) {
                setCurrentUserName(me.name);
                loginUserId.current = me.id;
            }
            preloaderProvider.hide()
        }
        catch (err) {
            preloaderProvider.hide()
            toast(`${err}`)
        }
    }
    const handleChangeUsername = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            if (!auth.user?.id) throw new Error("No user id");
            await updateUserName(auth.user.id, usernameInput);
            await getUsers();
            toast.success("Username updated!");
            setShowChangeUsername(false);
        } catch (err) {
            toast.error(`${err}`)
        }
    };

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
        getTeam();
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

    function UserRow({user}: {user: UserDTO}) {
        return <div className="flex">
            <div className="sticky left-0 z-10 w-[150px] shrink-0 p-2 md:p-4 font-semibold text-center border-b border-r border-border/50 bg-card text-xs md:text-sm overflow-hidden text-ellipsis whitespace-nowrap wrap-anywhere">
                {user.name}
            </div>
            {days.map(d => {
                const val = getScheduleDisplay(user.user_id, d);
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
                                <DropdownMenuItem onClick={() => handleScheduleSelection("wfh", d, user.user_id)}>
                                    <LucideHouse /> WFH
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleScheduleSelection("leave", d, user.user_id)}>
                                    <LucideUserX /> Leave
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleScheduleSelection("compensation", d, user.user_id)}>
                                    <LucideCalendarCheck /> Compensation
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleScheduleSelection("extra", d, user.user_id)}>
                                    <LucideCircleEllipsis /> Extra
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleScheduleSelection("clear", d, user.user_id)}>
                                    <LucideTrash /> Clear
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            })}
        </div>
    }

    return <>
        {/* Change Username Dialog */}
        <Dialog open={showChangeUsername} onOpenChange={setShowChangeUsername}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleChangeUsername}>
                    <DialogHeader>
                        <DialogTitle>Change Username</DialogTitle>
                        <DialogDescription>Update your display name for the team.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="username" className="text-sm font-medium">Username</label>
                            <Input
                                id="username"
                                value={usernameInput}
                                onChange={e => setUsernameInput(e.target.value)}
                                placeholder="Enter new username"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        <div className="flex flex-col mt-0 px-[24px] w-full">
            <Card className="mb-4">
                <CardContent>
                    <div className="flex items-center flex-col gap-4 lg:flex-row lg:justify-between">
                        <div className="flex items-center gap-4 justify-between w-full lg:justify-start">
                            <div className="flex flex-col">
                                <div className="text-xl md:text-2xl font-bold">
                                    {teamName}'s
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
                                        <DropdownMenuItem onClick={() => {
                                            setUsernameInput(currentUserName);
                                            setShowChangeUsername(true);
                                        }}>
                                            <LucideUserPen /> Change username
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setShowChangeTeam(true)}>
                                            <LucideCircleEllipsis /> Change team
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={async () => {
                                            try {
                                                const teamKey = await getTeamKeyOfUser(auth.user?.id!);
                                                await navigator.clipboard.writeText(teamKey);
                                                toast.success("Team key copied to clipboard!");
                                            } catch (err) {
                                                toast.error("No team key found.");
                                            }
                                        }}>
                                            <LucideUser /> Copy team key
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setShowLeaveTeam(true)} disabled={changeLoading}>
                                            <LucideTrash /> Leave team
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { auth.signOut() }}>
                                            <LucideLogOut /> Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    {/* Change Team Dialog */}
                                    <Dialog open={showChangeTeam} onOpenChange={setShowChangeTeam}>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <form onSubmit={e => { e.preventDefault(); handleChangeTeam(); }}>
                                                <DialogHeader>
                                                    <DialogTitle>Change Team</DialogTitle>
                                                    <DialogDescription>Enter the new team key to join a different team. You will be removed from your current team.</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <label htmlFor="teamkey" className="text-sm font-medium">Team Key</label>
                                                        <Input
                                                            id="teamkey"
                                                            value={newTeamKey}
                                                            onChange={e => setNewTeamKey(e.target.value)}
                                                            placeholder="Enter new team key"
                                                            required
                                                            disabled={changeLoading}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline" type="button">Cancel</Button>
                                                    </DialogClose>
                                                    <Button type="submit" disabled={changeLoading || !newTeamKey}>Change</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Leave Team Confirmation Dialog */}
                                    <Dialog open={showLeaveTeam} onOpenChange={setShowLeaveTeam}>
                                        <DialogContent className="sm:max-w-[400px]">
                                            <DialogHeader>
                                                <DialogTitle>Leave Team</DialogTitle>
                                                <DialogDescription>Are you sure you want to leave your current team? This action cannot be undone.</DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline" type="button">Cancel</Button>
                                                </DialogClose>
                                                <Button variant="destructive" onClick={handleLeaveTeam} disabled={changeLoading}>Leave Team</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </DropdownMenu>
                                <Button onClick={() => { handleScroll() }} variant="outline"><LucideCalendar></LucideCalendar> Today</Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <ModeToggle></ModeToggle>
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
                            {users.filter(u => u.id === loginUserId.current).map(u => (
                                <UserRow key={u.user_id} user={u} />
                            ))}
                            {users.filter(u => u.id !== loginUserId.current).map(u => (
                                <UserRow key={u.user_id} user={u} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </>
}

export default HomePage;