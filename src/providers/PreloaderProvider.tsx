import { createContext, useContext, useState, type ReactNode } from "react";



type PreloaderContext = {
    show: () => void,
    hide: () => void,
    isLoading: boolean
}
const preloaderContext = createContext<PreloaderContext | undefined>(undefined);


export const PreloaderProvider = ({ children }: { children: ReactNode }) => {

    const [isLoading, setIsloading] = useState(false);

    const show = () => {
        setIsloading(true)
    }
    const hide = () => {
        setIsloading(false);
    }

    return (
        <preloaderContext.Provider value={{ show, hide, isLoading }}>
            {children}
        </preloaderContext.Provider>
    )

}

export const usePreloader = () => {
    const ctx = useContext(preloaderContext);
    if (!ctx) throw new Error("user Preloader context from inside Preloader provider")
    return ctx;
}