const getScheduleClass = (type: string) => {
    switch (type) {
        case 'L': return "bg-red-200 text-red-800 font-bold";
        case 'W': return "bg-blue-200 text-blue-800 font-bold";
        case 'E': return "bg-yellow-200 text-yellow-800 font-bold";
        case 'C': return "bg-green-200 text-green-800 font-bold";
        default: return "";
    }
};
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
import { getAllUsersSchedule, getNameFromEmail, clearSchedule } from "@/utils/users";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { addUser } from "@/utils/users";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getAllUsers, setUserSchedule, isAlreadyAdded } from "@/utils/users";
import type { UserDTO } from "@/Models/user_model";
import { usePreloader } from "@/providers/PreloaderProvider";
import { Card, CardContent } from "@/components/ui/card";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import type { ScheduleType } from "@/Models/schedule_type_model";
import type { Schedule } from "@/Models/schedule_model";

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


const HomePage = () => {
    const auth = useAuth();
    const preloaderProvider = usePreloader();
    const [users, setUsers] = useState<UserDTO[]>([])
    const [schedules, SetSchedules] = useState<Schedule[]>([])

    const [isAdded, setIsAdded] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const getHeaderClass = (day: number) => {
        if (day === 1 || day === 4 || day === 5) {
            return "bg-blue-300 text-black"
        }
        else if (day === 0 || day === 6) {
            return "bg-green-300 text-black"
        }
        else {
            return "";
        }
    }

    const handleAddInTeam = async () => {
        const name = auth.user?.email?.split("@")[0]
        const id = auth.user?.id
        try {
            await addUser(name!, "upgrade", id!)
            toast("Done")
        }
        catch (err) {
            toast(`${err}`)
        }
    }

    const handleScheduleSelection = async (event: ScheduleType | "clear", date: Date) => {
        console.log(date)
        if (event === "clear") {
            try {
                preloaderProvider.show()
                await clearSchedule(date)
                await getSchedules()

                preloaderProvider.hide()
            } catch (err) {
                preloaderProvider.hide()
                toast(`${err}`)
            }
        }
        else {
            try {
                preloaderProvider.show()
                await setUserSchedule(event, date)

                await getSchedules()

                preloaderProvider.hide()
            } catch (err) {
                preloaderProvider.hide()
                toast(`${err}`)
            }
        }
    }

    const getUsers = async () => {
        try {
            preloaderProvider.show()
            setUsers(await getAllUsers())
            preloaderProvider.hide()
        }
        catch (err) {
            preloaderProvider.hide()
            toast(`${err}`)
        }
    }

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
        <div className='flex items-center fixed top-0 h-[60px] p-2 w-full justify-between'>
            <ModeToggle></ModeToggle>
            <div className="flex items-center gap-2">
                {getNameFromEmail(auth.user?.email!)}
                <Button onClick={() => { auth.signOut() }}>Logout</Button>
                <Button disabled={isAdded} onClick={() => { handleAddInTeam() }}>Add me</Button>
            </div>
        </div>
        <div className="main">
            <div className="w-5xl">
                <Card>
                    <CardContent className="overflow-auto ">
                        <div className="flex justify-between items-center mb-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
                                &lt;
                            </Button>
                            <span className="font-semibold text-lg">{start.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
                                &gt;
                            </Button>
                        </div>
                        <Table className="mb-5">
                            <TableHeader >
                                <TableRow>
                                    <TableHead className="bg-[var(--muted)] w-[100px] sticky left-0">
                                        Name
                                    </TableHead>
                                    {days.map((d) => {
                                        return (
                                            <TableHead key={d.getDate()} className={`${getHeaderClass(d.getDay())}`}>
                                                <div className="flex flex-col items-center">
                                                    <div>{weekdayNames[d.getDay()]}</div>
                                                    <div>{d.getDate()}</div>
                                                </div>
                                            </TableHead>)
                                    })}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(u => <TableRow key={u.id}>
                                    <TableCell className="bg-[var(--muted)] sticky left-0">{u.name}</TableCell>
                                    {days.map(d => (
                                        <TableCell key={d.getTime()} className="text-center">
                                            {u.user_id === auth.user!.id ? (
                                                <ContextMenu>
                                                    <ContextMenuTrigger className="w-full h-full cursor-pointer">
                                                        {(() => {
                                                            const val = getScheduleDisplay(u.user_id, d);
                                                            return <div className={`h-full w-full rounded ${getScheduleClass(val)}`}>{val}</div>;
                                                        })()}
                                                    </ContextMenuTrigger>
                                                    <ContextMenuContent>
                                                        <ContextMenuItem onClick={() => handleScheduleSelection("wfh", d)}>WFH</ContextMenuItem>
                                                        <ContextMenuItem onClick={() => handleScheduleSelection("leave", d)}>Leave</ContextMenuItem>
                                                        <ContextMenuItem onClick={() => handleScheduleSelection("compensation", d)}>Compenstation</ContextMenuItem>
                                                        <ContextMenuItem onClick={() => handleScheduleSelection("extra", d)}>Extra</ContextMenuItem>
                                                        <ContextMenuItem onClick={() => handleScheduleSelection("clear", d)}>Clear</ContextMenuItem>
                                                    </ContextMenuContent>
                                                </ContextMenu>
                                            ) : (
                                                (() => {
                                                    const val = getScheduleDisplay(u.user_id, d);
                                                    return <div className={`h-full w-full rounded ${getScheduleClass(val)}`}>{val}</div>;
                                                })()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>

    </>
}

export default HomePage;