import { useAuth } from "@/auth/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { usePreloader } from "@/providers/PreloaderProvider"
import { supabase } from "@/utils/supabase"
import { addUserToTeam, verifyTeamKey } from "@/utils/Teams"
import { LucideArrowLeft } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const TeamKeyPage = () => {
    const preloaderProvider = usePreloader()
    const [teamKey, setTeamKey] = useState("");
    const navigate = useNavigate()
    const auth = useAuth()

    const handleOTPInput = (value: string) => {
        setTeamKey(value)
    }

    const handleVerifyTeamKey = async () => {
        preloaderProvider.show()
        try {
            const team_id = await verifyTeamKey(teamKey)
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
                        <CardFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => handleSignout()}>Signout</Button>
                            <Button type="submit">Let's go</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </>
    )
}

export default TeamKeyPage