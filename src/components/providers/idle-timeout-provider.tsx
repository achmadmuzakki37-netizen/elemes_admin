'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/app/(auth)/login/auth-actions'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// 15 Minutes
const IDLE_TIMEOUT = 15 * 60 * 1000
// 14 Minutes
const WARNING_TIMEOUT = 14 * 60 * 1000

export function IdleTimeoutProvider({ children }: { children: React.ReactNode }) {
    const [showWarning, setShowWarning] = useState(false)
    const [countdown, setCountdown] = useState(60) // 60 seconds warning
    const lastActivityTime = useRef<number>(0)
    const router = useRouter()
    const countdownInterval = useRef<NodeJS.Timeout | null>(null)
    const globalCheckInterval = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        lastActivityTime.current = Date.now()
    }, [])

    const handleLogout = useCallback(async () => {
        if (countdownInterval.current) clearInterval(countdownInterval.current)
        if (globalCheckInterval.current) clearInterval(globalCheckInterval.current)

        await signOut()
        router.refresh()
    }, [router])

    const startCountdown = useCallback(() => {
        setShowWarning(true)
        setCountdown((IDLE_TIMEOUT - WARNING_TIMEOUT) / 1000) // 60 seconds diff

        if (countdownInterval.current) clearInterval(countdownInterval.current)

        countdownInterval.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (countdownInterval.current) clearInterval(countdownInterval.current)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [])

    // Event Checkers
    useEffect(() => {
        const events = [
            'mousemove',
            'mousedown',
            'keydown',
            'touchstart',
            'scroll'
        ]

        const resetIdleTimer = () => {
            // User MUST click "Tetap Login" to reset it when the warning is active.
            if (showWarning) return

            lastActivityTime.current = Date.now()
        }

        // Attach event listeners for activity
        events.forEach((event) => {
            window.addEventListener(event, resetIdleTimer, { passive: true })
        })

        // Global interval to check the elapsed idle time
        globalCheckInterval.current = setInterval(() => {
            if (showWarning) {
                // Warning is active, check absolute logout condition against original activity timestamp + idle timeout
                const timePassedSinceWarningShowed = Date.now() - lastActivityTime.current
                if (timePassedSinceWarningShowed >= IDLE_TIMEOUT) {
                    handleLogout()
                }
                return;
            }

            const timePassed = Date.now() - lastActivityTime.current

            if (timePassed >= IDLE_TIMEOUT) {
                handleLogout()
            } else if (timePassed >= WARNING_TIMEOUT && !showWarning) {
                startCountdown()
            }
        }, 1000) // Check every second

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, resetIdleTimer)
            })
            if (countdownInterval.current) clearInterval(countdownInterval.current)
            if (globalCheckInterval.current) clearInterval(globalCheckInterval.current)
        }
    }, [handleLogout, showWarning, startCountdown])

    const handleStayLoggedIn = () => {
        setShowWarning(false)
        if (countdownInterval.current) clearInterval(countdownInterval.current)
        // Reset the time based on current time
        lastActivityTime.current = Date.now()
    }

    return (
        <>
            {children}

            <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Peringatan Sesi Berakhir</DialogTitle>
                        <DialogDescription>
                            Sesi Anda akan berakhir dalam <span className="font-bold text-red-500">{countdown} detik</span> karena tidak ada aktivitas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-4 text-4xl font-mono text-zinc-900 dark:text-zinc-100">
                        00:{countdown.toString().padStart(2, '0')}
                    </div>
                    <DialogFooter className="sm:justify-end gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleLogout}
                        >
                            Log Out Sekarang
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleStayLoggedIn}
                        >
                            Tetap Login
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
