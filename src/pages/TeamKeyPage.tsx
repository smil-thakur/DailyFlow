import { useAuth } from "@/auth/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { usePreloader } from "@/providers/PreloaderProvider"
import { supabase } from "@/utils/supabase"
import { addUserToTeam, createTeam, verifyTeamKey } from "@/utils/Teams"
import { addUser, getNameFromEmail } from "@/utils/users";
import { Input } from "@/components/ui/input";
import { LucideArrowLeft } from "lucide-react"
import { useState } from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const TeamKeyPage = () => {
    const preloaderProvider = usePreloader()
    const [teamKey, setTeamKey] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [creating, setCreating] = useState(false);
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const navigate = useNavigate()
    const auth = useAuth()

    const handleOTPInput = (value: string) => {
        setTeamKey(value)
    }

    const handleVerifyTeamKey = async () => {
        preloaderProvider.show()
        try {
            const team_id = await verifyTeamKey(teamKey)
            await addUser(getNameFromEmail(auth.user?.email!), team_id, auth.user?.id!);
            await addUserToTeam(team_id, auth.user?.id!);
            preloaderProvider.hide()
            navigate("/home")

        } catch (err) {
            preloaderProvider.hide()
            toast.error(
                "Unable to add you in team",
                {
                    description: `${err}, try again later!`
                }
            )
        }
    }

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName) return;
        setCreating(true);
        try {
            const { team_id, team_key } = await createTeam(newTeamName);
            await addUser(getNameFromEmail(auth.user?.email!), team_id, auth.user?.id!);
            await addUserToTeam(team_id, auth.user?.id!);
            setCreatedKey(team_key);
            toast.success("Team created! Redirecting...");
            navigate("/home");
        } catch (err) {
            toast.error(`Failed to create team: ${err}`);
        } finally {
            setCreating(false);
        }
    };

    const handleBack = () => {

        navigate("/verifyOTP")
    }

    const handleSignout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error(error.message)
        }
    }

    return (
        <>
            <div className='flex items-center fixed top-0 h-[60px] p-2 w-full'>
                <ModeToggle></ModeToggle>
            </div>
            <div className="flex items-center">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyTeamKey();
                }}>
                    <Card className="w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Button type="button" onClick={() => { handleBack() }} variant="outline"><LucideArrowLeft></LucideArrowLeft></Button>
                                Team key
                            </CardTitle>
                            <CardDescription>
                                A team key has been given by your senior enter the team key to access the calender, or ask your team lead to generate one!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InputOTP maxLength={6} onChange={handleOTPInput}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </CardContent>
                        <CardFooter className="gap-2 flex-col sm:flex-row">
                            <div className="flex gap-2 w-full">
                                <Button type="button" variant="outline" onClick={() => handleSignout()}>Signout</Button>
                                <Button type="submit">Let's go</Button>
                            </div>
                            <div className="w-full flex flex-col items-center">
                                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowCreate(true)}>
                                    Create a new team
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleCreateTeam}>
                        <DialogHeader>
                            <DialogTitle>Create a New Team</DialogTitle>
                            <DialogDescription>Enter a team name. A unique team key will be generated and you will be added to the team.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Input
                                className="mb-2"
                                placeholder="Team name"
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                required
                                disabled={creating}
                            />
                            {createdKey && (
                                <div className="mb-2 text-green-700 dark:text-green-400 text-sm">
                                    Team created! Your team key: <span className="font-mono font-bold">{createdKey}</span>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button" disabled={creating}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={creating || !newTeamName}>Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default TeamKeyPage