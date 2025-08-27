import { usePreloader } from "@/providers/PreloaderProvider"

export const PreloaderPage = () => {
    const preloaderProvider = usePreloader()
    return (
        < div className="preloader" style={{ "display": preloaderProvider.isLoading ? "flex" : "none" }}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spinner"
            >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
        </div >
    )
}